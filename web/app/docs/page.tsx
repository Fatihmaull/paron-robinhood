import type { Metadata } from "next";
import { DOCS_INTRO, DOCS_NOTES, DOCS_STEPS } from "@/lib/docs-content";

export const metadata: Metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <article>
      <h1>How to use Paron</h1>
      <p className="lede">{DOCS_INTRO}</p>
      <div className="grid docs">
        <nav className="panel operator-tools" aria-label="Contents">
          <h2>Contents</h2>
          {DOCS_STEPS.map((step, index) => (
            <a key={step.image} href={`#step-${index + 1}`}>
              {step.title}
            </a>
          ))}
        </nav>
        <div className="grid">
          {DOCS_STEPS.map((step, index) => (
            <section className="panel" id={`step-${index + 1}`} key={step.image}>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
              <img src={step.image} alt={step.alt} width={step.width} height={step.height} />
            </section>
          ))}
          <section className="panel">
            <h2>Good to know</h2>
            <ul>
              {DOCS_NOTES.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
