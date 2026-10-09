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

export function revertName(error: unknown): string | null {
  const text = error instanceof Error ? error.message : String(error);
  const known = [
    "NotDefaultable",
    "DisputeWindowOpen",
    "RulingDeadlineNotReached",
    "NotProviderRole",
    "StaleAttestation",
    "InvalidLot",
    "FaucetCooldown",
    "SaleClosed",
    "Paused",
  ];
  return known.find((name) => text.includes(name)) ?? null;
}

export const STALE_DEADLINE_REVERTS = new Set([
  "NotDefaultable",
  "DisputeWindowOpen",
  "RulingDeadlineNotReached",
]);
