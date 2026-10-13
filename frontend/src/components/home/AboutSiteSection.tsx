import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { queryFlow } from "../../data/project";
import { Section } from "../ui/Section";

export function AboutSiteSection() {
  return (
    <Section id="about-site" title="This site">
      <p className="max-w-[60ch] text-[15px] leading-relaxed text-fg-2">
        The chat on this page is a small retrieval-augmented system I built. An LLM router sends each question to an
        agent; résumé questions search embeddings of my CV in pgvector, and Llama 3.3 70B writes an answer grounded in
        what it finds.
      </p>
      <ol aria-label="How a question is answered" className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted">
        {queryFlow.map((step, i) => (
          <li key={step.title} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-soft">→</span>}
            {step.title}
          </li>
        ))}
      </ol>
      <Link
        to="/chat"
        className="no-print group mt-5 inline-flex items-center gap-1 text-sm font-medium text-fg transition hover:text-accent"
      >
        Open the chat
        <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
      </Link>
    </Section>
  );
}
