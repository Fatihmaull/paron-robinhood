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

/** Display USD. Two decimals, or up to 6 when digits 3–6 are nonzero. */
export function formatUsd(amount: string | null | undefined): string {
  if (amount == null || amount === "") return "—";
  let raw: bigint;
  try {
    raw = parseUsd6(amount);
  } catch {
    return amount;
  }
  const neg = raw < 0n;
  const abs = neg ? -raw : raw;
  const whole = (abs / SCALE6).toString();
  const six = (abs % SCALE6).toString().padStart(6, "0");
  let end = 2;
  for (let i = 5; i >= 2; i--) {
    if (six[i] !== "0") {
      end = i + 1;
      break;
    }
  }
  return `${neg ? "-" : ""}$${whole}.${six.slice(0, end)}`;
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

export function shortId(value: string | null | undefined): string {
  if (!value) return "—";
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
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
