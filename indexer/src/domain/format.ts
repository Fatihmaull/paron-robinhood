import { hexToBytes } from "viem";

const USDC_SCALE = 1_000_000n;
const CU_SCALE = 10n ** 18n;
const FACTOR_SCALE = 10_000n;

export function formatUsdc(raw: bigint | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const whole = abs / USDC_SCALE;
  const frac = (abs % USDC_SCALE).toString().padStart(6, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${frac}`;
}

/** CU with trailing zeros stripped (`"20"`, `"0.5"`). */
export function formatCu(raw: bigint | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const whole = abs / CU_SCALE;
  const fracRaw = (abs % CU_SCALE).toString().padStart(18, "0").replace(/0+$/, "");
  const body = fracRaw.length === 0 ? whole.toString() : `${whole.toString()}.${fracRaw}`;
  return `${negative ? "-" : ""}${body}`;
}

export function formatFactor(raw: number | bigint): string {
  const value = typeof raw === "bigint" ? raw : BigInt(raw);
  const whole = value / FACTOR_SCALE;
  const frac = (value % FACTOR_SCALE).toString().padStart(4, "0");
  return `${whole.toString()}.${frac}`;
}

/** Floor a rational to `decimals` places (P3-30, coverage). */
export function formatRatioFloor(numerator: bigint, denominator: bigint, decimals: number): string | null {
  if (denominator === 0n) return null;
  const scale = 10n ** BigInt(decimals);
  const scaled = (numerator * scale) / denominator;
  const whole = scaled / scale;
  const frac = (scaled % scale).toString().padStart(decimals, "0");
  return `${whole.toString()}.${frac}`;
}

/**
 * Half-up to `decimals` places.
 * Approved E16 example prints 10/18 as `"0.556"`, which is half-up, not a floor.
 */
export function formatRatioHalfUp(numerator: bigint, denominator: bigint, decimals: number): string | null {
  if (denominator === 0n) return null;
  const negative = numerator < 0n;
  const num = negative ? -numerator : numerator;
  const scale = 10n ** BigInt(decimals);
  const scaled = (num * scale + denominator / 2n) / denominator;
  const whole = scaled / scale;
  const frac = (scaled % scale).toString().padStart(decimals, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${frac}`;
}

export function formatSignedUsdc(raw: bigint): string {
  return formatUsdc(raw) ?? "0.000000";
}

export function mulDiv(a: bigint, b: bigint, d: bigint): bigint {
  if (d === 0n) return 0n;
  return (a * b) / d;
}

export function nativePrice(cuPrice: bigint, factor: number | bigint): bigint {
  return mulDiv(cuPrice, BigInt(factor), FACTOR_SCALE);
}

export function nativeGpuHours(qtyCu: bigint, factor: number | bigint): bigint {
  return mulDiv(qtyCu, FACTOR_SCALE, BigInt(factor));
}

export function notionalUsdc(qtyCu: bigint, cuPrice: bigint): bigint {
  return mulDiv(qtyCu, cuPrice, CU_SCALE);
}

export function deliveryWindowOf(windowStartSec: bigint): string {
  const date = new Date(Number(windowStartSec) * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthOf(tsSec: bigint): string {
  return deliveryWindowOf(tsSec);
}

export function tsIso(tsSec: bigint): string {
  return new Date(Number(tsSec) * 1000).toISOString().replace(".000Z", "Z");
}

export function tsMs(tsSec: bigint): number {
  return Number(tsSec) * 1000;
}

const CONTINENTS = ["AF", "AN", "AS", "EU", "NA", "OC", "SA"] as const;

export function continentCode(value: number): string {
  return CONTINENTS[value] ?? "AS";
}

export function bytes2ToAscii(value: `0x${string}`): string {
  const bytes = hexToBytes(value.length === 4 ? `0x${value.slice(2).padStart(4, "0")}` : value);
  return new TextDecoder().decode(bytes).replace(/\0/g, "").trim();
}

export function lowerAddress(value: string): `0x${string}` {
  return value.toLowerCase() as `0x${string}`;
}

export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

export const CU = CU_SCALE;
export const USDC = USDC_SCALE;
