const CU = 10n ** 18n;
const BPS = 10_000n;

export const ZERO_BYTES32 = `0x${"0".repeat(64)}` as const;

/** Display factor "1.4000" → 14000, matching ConversionTable.factorOf. */
export function factorBps(display: string | undefined): bigint {
  if (!display) return BPS;
  const [whole, frac = ""] = display.split(".");
  if (!/^\d+$/.test(whole) || (frac !== "" && !/^\d+$/.test(frac))) return BPS;
  return BigInt(whole) * BPS + BigInt((frac + "0000").slice(0, 4));
}

/** SeriesFactory._bondAmount: bondPerCU * gpuHours * factor / 10000. */
export function seriesBondRaw(bondPerCu: bigint, gpuHours: bigint, factor: bigint): bigint {
  const maxSupply = (gpuHours * factor * CU) / BPS;
  return (bondPerCu * maxSupply) / CU;
}

/** ParonMath.ceilMulDiv. */
export function ceilNotional(qty: bigint, price: bigint): bigint {
  if (qty === 0n || price === 0n) return 0n;
  return (qty * price + CU - 1n) / CU;
}

/** USDC a bid must approve: resting escrow plus the taker fee if the bid fills. */
export function bidUsdcAllowance(qty: bigint, price: bigint, takerFeeBps: bigint): bigint {
  const notional = ceilNotional(qty, price);
  return notional + (notional * takerFeeBps) / BPS;
}

export function splitSignature(signature: `0x${string}`): {
  r: `0x${string}`;
  s: `0x${string}`;
  v: number;
} {
  const raw = signature.slice(2);
  return {
    r: `0x${raw.slice(0, 64)}` as `0x${string}`,
    s: `0x${raw.slice(64, 128)}` as `0x${string}`,
    v: Number(`0x${raw.slice(128, 130)}`),
  };
}

export function asBytes32(value: string): `0x${string}` {
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return value as `0x${string}`;
  return ZERO_BYTES32;
}

export function uint256Of(value: unknown, fallback: bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(Math.trunc(value));
  return fallback;
}
