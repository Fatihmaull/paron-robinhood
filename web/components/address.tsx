import { addressParts, shortId } from "@/lib/format";

/** Full checksum where the column is wide; middle ellipsis when it is not. */
export function FitAddress({ value }: { value: string | null | undefined }) {
  const parts = addressParts(value);
  if (!parts) return <span className="num">{shortId(value)}</span>;
  return (
    <span className="addr num" title={parts.full}>
      <span className="addr-head">{parts.head}</span>
      <span className="addr-tail">{parts.tail}</span>
    </span>
  );
}
