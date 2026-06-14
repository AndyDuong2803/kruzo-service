import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ";
import Container from "@/components/Container";
import Section from "@/components/Section";
import CTA from "@/components/CTA";
import StructuredData from "@/components/StructuredData";
import Reveal from "@/components/Reveal";
import { howItWorks, problemPoints, solutionWorkflow, useCases } from "@/data/landing";
import { createMetadata, faqPageJsonLd, organizationJsonLd, seoRoutes, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata = createMetadata(seoRoutes.home);

const HomePage: React.FC = () => {
  return (
    <>
      <StructuredData data={[organizationJsonLd, softwareApplicationJsonLd, faqPageJsonLd]} />
      <Hero />
      <Container>
        <Section
          id="problem"
          title="Manual document intake creates slow handoffs"
          description="Service teams often receive useful business data trapped inside PDFs, scans, photos, invoices, repair notes, and customer forms."
        >
          <div className="grid gap-5 md:grid-cols-3">
            {problemPoints.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className="h-full">
                <div className="brand-card hover-lift h-full rounded-xl p-6">
                  <div className="brand-icon icon-chip mb-5 flex h-12 w-12 items-center justify-center rounded-full">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-muted">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="workflow"
          title="AI reads first, people stay in control"
          description="Kruzo Document AI keeps the template workflow practical: extract, review, approve, then export in the format your team actually needs."
        >
          <div className="grid gap-5 lg:grid-cols-4">
            {solutionWorkflow.map((step, index) => (
              <Reveal key={step.eyebrow} delay={index * 60} className="h-full">
                <div className="brand-card hover-lift h-full rounded-xl p-6">
                  <p className="text-sm font-bold text-secondary">{step.eyebrow}</p>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-muted">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="use-cases"
          title="Built around service-business documents"
          description="Use Kruzo for repeat document flows where staff need structured output without giving up review control."
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 60} className="h-full">
                <div className="brand-card hover-lift h-full rounded-xl p-6">
                  <div className="brand-icon icon-chip mb-5 flex h-11 w-11 items-center justify-center rounded-full">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-muted">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="how-it-works"
          title="How the automation comes together"
          description="The strongest workflow starts with your real documents, expected fields, and review rules instead of a generic one-size-fits-all setup."
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <Reveal key={step.eyebrow} delay={index * 60} className="h-full">
                <div className="brand-card-muted hover-lift h-full border-l-4 border-l-primary p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-secondary">{step.eyebrow}</p>
                  <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-muted">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <FAQ />
        
        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
