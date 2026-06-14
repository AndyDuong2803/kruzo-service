import { ctaDetails } from "@/data/cta"
import { auditHighlights } from "@/data/landing"
import Link from "next/link"
import { HiArrowRight } from "react-icons/hi2"
import Reveal from "./Reveal"

const CTA: React.FC = () => {
    return (
        <section id="audit" className="section-anchor mt-10 mb-5 lg:my-20">
            <Reveal>
            <div className="cta-shell relative h-full w-full z-10 mx-auto py-12 sm:py-20">
                <div className="h-full w-full">
                    <div className="cta-background absolute inset-0 -z-10 h-full w-full rounded-3xl opacity-95">
                        <div className="cta-ambient absolute bottom-0 left-0 right-0 top-0 rounded-3xl bg-[radial-gradient(circle_600px_at_50%_500px,var(--cta-glow),transparent)]"></div>
                    </div>

                    <div className="h-full flex flex-col items-center justify-center text-white text-center px-5">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold mb-4 max-w-2xl">{ctaDetails.heading}</h2>

                        <p className="mx-auto max-w-xl md:px-5">{ctaDetails.subheading}</p>

                        <div className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
                            {auditHighlights.map((item, index) => (
                                <div key={item.title} className="hover-lift rounded-xl border border-white/15 bg-white/5 p-4 text-left backdrop-blur-sm" style={{ "--reveal-delay": `${index * 60}ms` } as React.CSSProperties}>
                                    <div className="mb-3 text-primary">{item.icon}</div>
                                    <h3 className="text-base font-semibold">{item.title}</h3>
                                    <p className="mt-1 text-sm text-white/75">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                            <Link href={ctaDetails.primaryCta.href} className="brand-button brand-button-primary button-pop gap-2 px-7 py-3">
                                {ctaDetails.primaryCta.text}
                                <HiArrowRight aria-hidden="true" />
                            </Link>
                            <Link href={ctaDetails.secondaryCta.href} className="brand-button button-pop border border-white/25 px-7 py-3 text-white transition-colors hover:border-primary hover:text-primary">
                                {ctaDetails.secondaryCta.text}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </Reveal>
        </section>
    )
}

export default CTA
