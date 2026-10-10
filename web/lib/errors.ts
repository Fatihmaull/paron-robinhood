const COPIES: Record<string, string> = {
  NotDefaultable:
    "Not claimable yet. The deadline passes at {deadline} (server time). If the button is live, send it: the contract decides.",
  DisputeWindowOpen: "The dispute window is still open.",
  RulingDeadlineNotReached: "The ruling deadline has not passed.",
  NotProviderRole:
    "This attestation is for a buyer. Providers need a provider verification (role 1).",
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

export function revertName(error: unknown): string | null {
  const text = error instanceof Error ? error.message : String(error);
  return REVERT_NAMES.find((name) => text.includes(name)) ?? null;
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
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
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
  return "Transaction failed.";
}

export const STALE_DEADLINE_REVERTS = new Set([
  "NotDefaultable",
  "DisputeWindowOpen",
  "RulingDeadlineNotReached",
]);
