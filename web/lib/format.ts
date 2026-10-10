import { getAddress, isAddress } from "viem";

const SCALE6 = 1_000_000n;

export function parseUsd6(amount: string): bigint {
  const neg = amount.startsWith("-");
  const body = neg ? amount.slice(1) : amount;
  if (!/^\d+(\.\d+)?$/.test(body)) {
    throw new Error(`Not a decimal amount: ${amount}`);
  }
  const [whole, frac = ""] = body.split(".");
  const raw = BigInt(whole) * SCALE6 + BigInt((frac + "000000").slice(0, 6));
  return neg ? -raw : raw;
}

export function formatRaw6(raw: bigint): string {
  const neg = raw < 0n;
  const abs = neg ? -raw : raw;
  const whole = abs / SCALE6;
  const frac = (abs % SCALE6).toString().padStart(6, "0");
  return `${neg ? "-" : ""}${whole.toString()}.${frac}`;
}

function groupThousands(whole: string): string {
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Half-up a 6-decimal raw amount to cents (2 decimal places). */
function roundCents(raw: bigint): { neg: boolean; cents: bigint } {
  const neg = raw < 0n;
  const abs = neg ? -raw : raw;
  return { neg, cents: (abs + 5_000n) / 10_000n };
}

/** Display USD as $3,240.00. Always 2 decimals, with thousands separators. */
export function formatUsd(amount: string | null | undefined): string {
  if (amount == null || amount === "") return "—";
  let raw: bigint;
  try {
    raw = parseUsd6(amount);
  } catch {
    return amount;
  }
  const { neg, cents } = roundCents(raw);
  const whole = groupThousands((cents / 100n).toString());
  const frac = (cents % 100n).toString().padStart(2, "0");
  return `${neg ? "-" : ""}$${whole}.${frac}`;
}

/**
 * Max-cost field: 2 decimal places, no symbol.
 * Ceil so the cap still covers a quote that is not an exact cent.
 */
export function formatMaxCost(amount: string): string {
  const raw = parseUsd6(amount);
  const neg = raw < 0n;
  const abs = neg ? -raw : raw;
  const cents = (abs + 9_999n) / 10_000n;
  const whole = (cents / 100n).toString();
  const frac = (cents % 100n).toString().padStart(2, "0");
  return `${neg ? "-" : ""}${whole}.${frac}`;
}

export function formatCu(amount: string | null | undefined): string {
  if (amount == null || amount === "") return "—";
  const neg = amount.startsWith("-");
  const body = neg ? amount.slice(1) : amount;
  const [whole, frac = ""] = body.split(".");
  if (!frac || /^0+$/.test(frac)) return `${neg ? "-" : ""}${whole} CU`;
  const shown = (frac + "00").slice(0, 2);
  return `${neg ? "-" : ""}${whole}.${shown} CU`;
}

export function formatFactor(factor: string | null | undefined): string {
  if (!factor) return "—";
  const [whole, frac = ""] = factor.split(".");
  return `${whole}.${(frac + "00").slice(0, 2)}×`;
}

export function formatCoverage(coverage: string | null | undefined): string {
  if (!coverage || !/^\d+(\.\d+)?$/.test(coverage)) return "—";
  const [whole, frac = ""] = coverage.split(".");
  return `${whole}.${(frac + "00").slice(0, 2)}×`;
}

/** EIP-55 so an API lowercase address and an onchain checksummed address render the same. */
export function canonicalAddress(value: string): string {
  return isAddress(value) ? getAddress(value) : value;
}

export function shortId(value: string | null | undefined): string {
  if (!value) return "—";
  // A 4+4 slice of an EIP-55 address can hide every uppercase letter (0xda14…1d0f).
  // Show the full checksum for 20-byte addresses. Hashes stay abbreviated.
  if (isAddress(value)) return canonicalAddress(value);
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

/** Header wallet label: 0x + 4 hex, ellipsis, last 4. Example 0x3F8f…6ae9. */
export function shortAddress(value: string | null | undefined): string {
  if (!value) return "—";
  const full = isAddress(value) ? canonicalAddress(value) : value;
  if (full.length <= 10) return full;
  return `${full.slice(0, 6)}…${full.slice(-4)}`;
}

/** Full EIP-55 split so a narrow column can ellipsize the middle and keep the checksum tail. */
export function addressParts(value: string | null | undefined): { full: string; head: string; tail: string } | null {
  if (!value || !isAddress(value)) return null;
  const full = canonicalAddress(value);
  return { full, head: full.slice(0, -4), tail: full.slice(-4) };
}

export function formatWib(ms: number): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return `${fmt.format(new Date(ms))} WIB`;
}

export function formatCountdown(nowMs: number, deadlineMs: number): string {
  const delta = Math.floor(deadlineMs / 1000) - Math.floor(nowMs / 1000);
  const sign = delta < 0 ? "-" : "";
  const abs = Math.abs(delta);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

/** Claim clock. Stays at 0:00 once the deadline second has passed. */
export function claimCountdown(nowMs: number, deadlineMs: number): string {
  const signed = formatCountdown(nowMs, deadlineMs);
  return signed.startsWith("-") ? "0:00" : signed;
}

export function mulUsd(qtyWhole: string, price: string): bigint {
  if (!/^\d+$/.test(qtyWhole)) {
    throw new Error("qty");
  }
  return BigInt(qtyWhole) * parseUsd6(price);
}

export function quotePrimary(qtyWhole: string, price: string, feeBps = 100n): { cost: string; fee: string } {
  const cost = mulUsd(qtyWhole, price);
  const fee = (cost * feeBps) / 10_000n;
  return { cost: formatRaw6(cost), fee: formatRaw6(fee) };
}

export function isWholeCu(qty: string): boolean {
  return /^\d+$/.test(qty) && qty !== "0" && !/^0\d/.test(qty);
}

/** max(5% of claim, $5). Integer USDC math at 6 decimals. */
export function disputeBond(claimUsd: string): string {
  const claim = parseUsd6(claimUsd);
  const fivePct = (claim * 500n) / 10_000n;
  const floor = 5_000_000n;
  return formatRaw6(fivePct > floor ? fivePct : floor);
}
