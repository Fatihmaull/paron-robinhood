import { addressParts, shortAddress, shortId } from "@/lib/format";

/** Full checksum where it fits; 0x1234…5678 where it does not. */
export function FitAddress({ value }: { value: string | null | undefined }) {
  const parts = addressParts(value);
  if (!parts) return <span className="num">{shortId(value)}</span>;
  return (
    <span className="addr num" title={parts.full}>
      <span className="addr-wide">{parts.full}</span>
      <span className="addr-narrow">{shortAddress(parts.full)}</span>
    </span>
  );
}
