/** Which number the landing panel and the H100 page row should show. */

export type IndexQuoteLabel = "Index" | "Reference";

export type IndexQuoteInput = {
  status?: string;
  value?: string | null;
  reference?: { value?: string | null } | null;
};

export type IndexStripActivity = { participants: number; volumeCu: string };

/**
 * Status-strip counts. Zeros from the onchain fallback are not eligible volume,
 * so the strip omits them until both numbers are real and nonzero.
 */
export function indexStripActivity(row: {
  status?: string;
  participants?: number | null;
  eligible_volume_cu?: string | null;
} | null | undefined): IndexStripActivity | null {
  if (!row || row.status !== "OK") return null;
  const participants = row.participants;
  const volumeCu = row.eligible_volume_cu;
  if (typeof participants !== "number" || !Number.isInteger(participants) || participants <= 0) return null;
  if (typeof volumeCu !== "string" || !/^\d+(\.\d+)?$/.test(volumeCu) || Number(volumeCu) <= 0) return null;
  return { participants, volumeCu };
}

export function indexQuote(row: IndexQuoteInput | null | undefined): { label: IndexQuoteLabel; amount: string | null } {
  const reference = row?.reference?.value;
  if (reference) return { label: "Reference", amount: reference };
  if (row?.status === "OK" && row.value) return { label: "Index", amount: row.value };
  return { label: "Index", amount: null };
}
