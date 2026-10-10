/** Wallet connect helpers. Pure, so they can be unit tested without a browser wallet. */

export const CONNECT_TIMEOUT_MS = 30_000;
export const METAMASK_RDNS = "io.metamask";
export const METAMASK_INSTALL_URL = "https://metamask.io/download/";

export type ConnectorLike = { id: string; name: string; type?: string; rdns?: string | readonly string[] };

function isMetaMask(c: ConnectorLike): boolean {
  const rdns = typeof c.rdns === "string" ? [c.rdns] : c.rdns ?? [];
  return c.id === METAMASK_RDNS || rdns.includes(METAMASK_RDNS) || c.id === "metaMask" || c.name === "MetaMask";
}

function isInjectedLike(c: ConnectorLike): boolean {
  return c.type === "injected" || c.id === "injected";
}

/**
 * Prefer the EIP-6963 MetaMask connector, then any other discovered (EIP-6963) wallet,
 * then the generic injected connector (window.ethereum). Never a WalletConnect-style connector.
 */
export function pickConnector<T extends ConnectorLike>(connectors: readonly T[]): T | null {
  const usable = connectors.filter((c) => isInjectedLike(c) || c.type === undefined || isMetaMask(c));
  return (
    usable.find((c) => c.id === METAMASK_RDNS) ??
    usable.find(isMetaMask) ??
    usable.find((c) => c.id !== "injected" && isInjectedLike(c)) ??
    usable.find((c) => c.id === "injected") ??
    null
  );
}

/** True when a browser wallet can be reached: a discovered wallet, or window.ethereum. */
export function walletDetected(connectors: readonly ConnectorLike[], hasWindowEthereum: boolean): boolean {
  if (hasWindowEthereum) return true;
  return connectors.some((c) => c.id !== "injected" && isInjectedLike(c));
}

function codeOf(error: unknown): number | null {
  let value: unknown = error;
  for (let depth = 0; depth < 6 && value && typeof value === "object"; depth += 1) {
    const code = (value as { code?: unknown }).code;
    if (typeof code === "number") return code;
    value = (value as { cause?: unknown }).cause;
  }
  return null;
}

function textOf(error: unknown): string {
  const parts: string[] = [];
  let value: unknown = error;
  for (let depth = 0; depth < 6 && value && typeof value === "object"; depth += 1) {
    const o = value as { message?: unknown; shortMessage?: unknown; name?: unknown; cause?: unknown };
    for (const key of ["name", "shortMessage", "message"] as const) {
      if (typeof o[key] === "string") parts.push(o[key] as string);
    }
    value = o.cause;
  }
  return parts.join(" ");
}

export class ConnectTimeoutError extends Error {
  constructor() {
    super("Connection timed out.");
    this.name = "ConnectTimeoutError";
  }
}

export function connectErrorMessage(error: unknown): string {
  if (error instanceof ConnectTimeoutError) {
    return "No response from the wallet. Open MetaMask to approve, then try again.";
  }
  const code = codeOf(error);
  const text = textOf(error);
  if (code === 4001 || /user rejected|user denied|rejected the request|UserRejectedRequest/i.test(text)) {
    return "Connection rejected in MetaMask. Try again when ready.";
  }
  if (code === -32002 || /already pending|-32002/i.test(text)) {
    return "A request is already pending. Open MetaMask and approve or reject it, then try again.";
  }
  if (/ProviderNotFound|provider not found|no provider/i.test(text)) {
    return "No wallet detected. Install MetaMask, then reload.";
  }
  return "Could not connect. Try again.";
}

/** Reject after ms so the button can reset; the wallet request itself cannot be cancelled. */
export function withTimeout<T>(promise: Promise<T>, ms: number = CONNECT_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ConnectTimeoutError()), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}
