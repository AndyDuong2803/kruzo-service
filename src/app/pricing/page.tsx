import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import Container from "@/components/Container";

export const metadata = {
  title: "Kruzo Document AI Pricing",
  description: "Pilot and custom workflow options for Kruzo Document AI.",
};

const plans = [
  {
    name: "Free Workflow Audit",
    description: "For teams exploring automation.",
    points: [
      "Send 3-5 sample documents",
      "Review document types and fields",
      "Identify review points",
      "Recommend Excel, JSON, or system output",
    ],
    cta: "Get free workflow audit",
  },
  {
    name: "Paid Pilot",
    description: "For teams ready to test with real documents.",
    points: [
      "1 document type",
      "20-50 sample files",
      "Excel or JSON output prototype",
      "Human review flow",
    ],
    cta: "Talk to us",
    highlighted: true,
  },
  {
    name: "Custom Workflow",
    description: "For businesses needing integration.",
    points: [
      "Custom Excel template",
      "API integration",
      "Internal system export",
      "Support and improvement loop",
    ],
    cta: "Contact us",
  },
];

const PricingPage: React.FC = () => {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Early validation pricing</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">Start with a pilot workflow</h1>
            <p className="mt-3 text-muted">
              Pricing depends on document volume, complexity, review needs, and integration scope.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={plan.highlighted
                  ? "soft-glow rounded-2xl border border-[var(--accent-border)] bg-card p-6"
                  : "brand-card rounded-2xl p-6"
                }
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{plan.name}</p>
                <p className="mt-3 text-xl font-semibold">{plan.description}</p>
                <ul className="mt-6 grid gap-3">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-muted">
                      <FiCheckCircle className="mt-1 flex-shrink-0 text-secondary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/#audit" className="brand-button brand-button-primary button-pop mt-7 gap-2 px-5 py-2.5">
                  {plan.cta}
                  <HiArrowRight aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card-muted p-5 text-muted">
            We are not publishing fixed monthly SaaS pricing yet. The right plan depends on the documents,
            fields, confidence thresholds, review workflow, and export format you need.
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PricingPage;
