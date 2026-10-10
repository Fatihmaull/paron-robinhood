/** A row from GET /providers, which is 200 even when the connected wallet is absent. */

export type ListedProvider = { address: string; status?: string };

/**
 * Detail is GET /providers/:addr and 404s when the address is not a provider.
 * Only return an address that is already in the list.
 * An unknown wallet falls back to the first active row, never to its own detail URL.
 */
export function selectProviderAddress(connected: string | undefined, listed: ListedProvider[]): string | null {
  const match = connected
    ? listed.find((row) => row.address.toLowerCase() === connected.toLowerCase())
    : undefined;
  if (match) return match.address;
  const active = listed.find((row) => row.status === "ACTIVE");
  return (active ?? listed[0])?.address ?? null;
}

/** Retry transport failures and 5xx. A 404 is the answer, not a blip. */
export function retryLiveStatus(status: number): boolean {
  if (status === 0) return true;
  return status >= 500;
}

export function kybBannerKind(verified: boolean, pending: boolean): "verified" | "pending" | "not KYB" {
  if (verified) return "verified";
  if (pending) return "pending";
  return "not KYB";
}

export function sameWallet(connected: string | null | undefined, route: string | null | undefined): boolean {
  if (!connected || !route) return false;
  return connected.toLowerCase() === route.toLowerCase();
}
