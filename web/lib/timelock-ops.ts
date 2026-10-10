/** Factor scheduled on a timelock op. Live rows use `factor`; fixtures use `new_factor`. */
export function scheduledFactor(
  args: { new_factor?: string | null; factor?: string | null } | null | undefined,
): string | null {
  for (const value of [args?.new_factor, args?.factor]) {
    if (value == null) continue;
    const trimmed = value.trim();
    if (trimmed !== "") return trimmed;
  }
  return null;
}

export function opStatusKey(status: string): string {
  return status.trim().toUpperCase();
}

export function isReadyOp(status: string): boolean {
  return opStatusKey(status) === "READY";
}

export function isDoneOp(status: string): boolean {
  const key = opStatusKey(status);
  return key === "DONE" || key === "EXECUTED";
}
