/** Which number the landing panel and the H100 page row should show. */

export type IndexQuoteLabel = "Index" | "Reference";

export type IndexQuoteInput = {
  status?: string;
  value?: string | null;
  reference?: { value?: string | null } | null;
};

export function indexQuote(row: IndexQuoteInput | null | undefined): { label: IndexQuoteLabel; amount: string | null } {
  const reference = row?.reference?.value;
  if (reference) return { label: "Reference", amount: reference };
  if (row?.status === "OK" && row.value) return { label: "Index", amount: row.value };
  return { label: "Index", amount: null };
}
