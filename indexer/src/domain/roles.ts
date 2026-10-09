import { keccak256, toBytes } from "viem";

/** Role codes on ParticipantVerified (01 P-62). */
export function roleName(code: number): string {
  switch (code) {
    case 1:
      return "Provider";
    case 2:
      return "Buyer";
    case 3:
      return "Trader";
    case 4:
      return "MarketMaker";
    default:
      return "Unknown";
  }
}

const NAMED_ROLES = [
  "ADMIN_ROLE",
  "VERIFIER_ROLE",
  "ARBITER_ROLE",
  "PAUSER_ROLE",
  "FEED_SIGNER_ROLE",
  "MINTER_ROLE",
  "PROPOSER_ROLE",
  "EXECUTOR_ROLE",
  "CANCELLER_ROLE",
] as const;

const ROLE_HASH_TO_NAME = new Map<string, string>(
  NAMED_ROLES.map((name) => [keccak256(toBytes(name)), name]),
);

ROLE_HASH_TO_NAME.set(`0x${"0".repeat(64)}`, "DEFAULT_ADMIN_ROLE");

export function accessRoleName(role: `0x${string}`): string {
  return ROLE_HASH_TO_NAME.get(role.toLowerCase()) ?? role.toLowerCase();
}
