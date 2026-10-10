"use client";

import { addressParts, shortAddress, shortId } from "@/lib/format";

/** Short wallet label. The full checksum stays on the title and the copy action. */
export function FitAddress({ value }: { value: string | null | undefined }) {
  const parts = addressParts(value);
  if (!parts) return <span className="num">{shortId(value)}</span>;
  return (
    <button
      type="button"
      className="addr num addr-copy"
      title={parts.full}
      aria-label={`Copy ${parts.full}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void navigator.clipboard?.writeText(parts.full);
      }}
    >
      {shortAddress(parts.full)}
    </button>
  );
}
