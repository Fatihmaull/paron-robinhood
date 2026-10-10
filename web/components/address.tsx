"use client";

import { useEffect, useRef, useState } from "react";
import { addressParts, shortAddress, shortId } from "@/lib/format";

/** Short wallet label. The full checksum stays on the title and the copy action. */
export function FitAddress({ value }: { value: string | null | undefined }) {
  const parts = addressParts(value);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  if (!parts) return <span className="num">{shortId(value)}</span>;
  return (
    <span className="addr-wrap">
      <button
        type="button"
        className={`addr num addr-copy${copied ? " copied" : ""}`}
        title={parts.full}
        aria-label={`Copy ${parts.full}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void Promise.resolve(navigator.clipboard?.writeText(parts.full)).catch(() => undefined);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : shortAddress(parts.full)}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "Address copied" : ""}</span>
    </span>
  );
}
