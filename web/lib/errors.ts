const COPIES: Record<string, string> = {
  NotDefaultable:
    "Not claimable yet. The deadline passes at {deadline} (server time). If the button is live, send it: the contract decides.",
  DisputeWindowOpen: "The dispute window is still open.",
  RulingDeadlineNotReached: "The ruling deadline has not passed.",
  NotProviderRole:
    "This attestation is for a buyer. Providers need a provider verification (role 1).",
  NotVerified: "Verification missing or expired.",
  AlreadyRegistered: "This wallet is already registered.",
  StaleAttestation: "This verification has expired. Ask the verifier for a new one.",
  InvalidLotBuy: "Quantity must be a whole number of CU.",
  InvalidLotOrder: "Order size must be a whole number of CU.",
  FaucetCooldown: "Faucet cooling down. Try again at {nextAt}.",
  SaleClosed: "The primary sale is closed.",
  Paused: "This series is paused.",
};

export function errorCopy(name: string, vars: Record<string, string> = {}): string {
  const template = COPIES[name] ?? name;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

const REVERT_NAMES = [
  "NotDefaultable",
  "DisputeWindowOpen",
  "RulingDeadlineNotReached",
  "NotProviderRole",
  "NotVerified",
  "AlreadyRegistered",
  "StaleAttestation",
  "InvalidLot",
  "FaucetCooldown",
  "SaleClosed",
  "Paused",
  "SlippageExceeded",
  "MaxCostRequired",
  "ERC20InsufficientBalance",
  "ERC20InsufficientAllowance",
  "BuyerNotVerified",
  "SupplyExceeded",
] as const;

const GENERIC_FAILURE = /^(transaction failed\.?|execution reverted\.?|unknown error\.?|an unknown rpc error occurred.*|the contract function ".+" reverted\.?)$/i;

/** Walk viem's cause chain so a nested custom error is not reported as a bare failure. */
export function errorText(error: unknown): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  const visit = (value: unknown, depth: number) => {
    if (value == null || depth > 8 || seen.has(value)) return;
    if (typeof value === "string") {
      parts.push(value);
      return;
    }
    if (typeof value !== "object") return;
    seen.add(value);
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === "string") parts.push(obj.message);
    if (typeof obj.shortMessage === "string") parts.push(obj.shortMessage);
    if (typeof obj.details === "string") parts.push(obj.details);
    if (typeof obj.reason === "string") parts.push(obj.reason);
    if (Array.isArray(obj.metaMessages)) {
      for (const line of obj.metaMessages) {
        if (typeof line === "string") parts.push(line);
      }
    }
    const data = obj.data;
    if (data && typeof data === "object") {
      const name = (data as { errorName?: unknown }).errorName;
      if (typeof name === "string") parts.push(name);
    }
    if ("cause" in obj) visit(obj.cause, depth + 1);
  };
  visit(error, 0);
  return parts.join("\n");
}

export function revertName(error: unknown): string | null {
  const text = errorText(error);
  const matches = REVERT_NAMES.filter((name) => text.includes(name));
  matches.sort((a, b) => b.length - a.length);
  return matches[0] ?? null;
}

function plainReason(error: unknown): string | null {
  const text = errorText(error);
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 240) continue;
    if (GENERIC_FAILURE.test(trimmed)) continue;
    if (/contract call:|request arguments:|version: viem/i.test(trimmed)) continue;
    return trimmed;
  }
  return null;
}

function cooldownLeft(nowMs: number, deadlineMs: number): string {
  const delta = Math.max(0, Math.floor(deadlineMs / 1000) - Math.floor(nowMs / 1000));
  const minutes = Math.floor(delta / 60);
  const seconds = delta % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function cooldownNextAt(raw: string): string {
  const match = raw.match(/FaucetCooldown[\s\S]{0,80}?(\d{10})/);
  if (!match) return "the next hour";
  const ms = Number(match[1]) * 1000;
  if (!Number.isFinite(ms)) return "the next hour";
  const clock = new Date(ms).toISOString().slice(11, 16) + " UTC";
  if (ms <= Date.now()) return clock;
  return `${clock} (${cooldownLeft(Date.now(), ms)} left)`;
}

/** Short status line. Unknown failures stay "Transaction failed." */
export function failureReason(err: unknown): string {
  const raw = errorText(err);
  if (/user rejected|user denied|rejected the request/i.test(raw)) return "Transaction rejected.";
  const name = revertName(err);
  if (name === "FaucetCooldown") return errorCopy("FaucetCooldown", { nextAt: cooldownNextAt(raw) });
  if (name === "SlippageExceeded" || name === "MaxCostRequired") return "max cost too low";
  if (name === "InvalidLot") return "Quantity must be a whole number of CU.";
  if (name === "ERC20InsufficientBalance") return "insufficient balance";
  if (name === "ERC20InsufficientAllowance") return "approval too low";
  if (name === "BuyerNotVerified") return "buyer is not verified";
  if (name === "SupplyExceeded") return "not enough supply";
  if (name && name in COPIES) return errorCopy(name);
  if (name) return name;
  return plainReason(err) ?? "Transaction failed.";
}

export const STALE_DEADLINE_REVERTS = new Set([
  "NotDefaultable",
  "DisputeWindowOpen",
  "RulingDeadlineNotReached",
]);
