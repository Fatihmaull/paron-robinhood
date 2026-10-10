import type { Metadata } from "next";
import Link from "next/link";
import { DOCS_INTRO, DOCS_NOTES, DOCS_STEPS } from "@/lib/docs-content";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <article className="docs">
      <h1>How to use Paron</h1>
      <p className="lede">{DOCS_INTRO}</p>
      <ol className="docs-steps">
        {DOCS_STEPS.map((step, index) => (
          <li className="docs-step" key={step.image}>
            <h2>
              <span className="docs-n">{String(index + 1).padStart(2, "0")}</span>
              {step.title}
            </h2>
            <p>{step.text}</p>
            {step.link ? (
              <Link className="touch-link" href={step.link.href}>
                {step.link.label}
              </Link>
            ) : null}
            <img
              src={step.image}
              alt={step.alt}
              width={step.width}
              height={step.height}
              loading="lazy"
            />
          </li>
        ))}
      </ol>
      <section className="docs-notes">
        <h2>Good to know</h2>
        <ul>
          {DOCS_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
