import React from 'react';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

import { heroDetails } from '@/data/hero';

const Hero: React.FC = () => {
    const inputDocuments = ['Repair order PDF', 'Scanned customer form', 'Vendor invoice'];
    const extractedFields = [
        ['customer_name', 'Maria Nguyen'],
        ['document_type', 'Repair order'],
        ['total_amount', '$428.60'],
    ];
    const animationDelay = (delay: number) => ({ "--animation-delay": `${delay}ms` } as React.CSSProperties);

    return (
        <section
            id="hero"
            className="relative flex items-center justify-center pb-0 pt-32 md:pt-40 px-5"
        >
            <div className="absolute left-0 top-0 bottom-0 -z-10 w-full">
                <div className="absolute inset-0 h-full w-full bg-hero-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]">
                </div>
            </div>

            <div className="absolute left-0 right-0 bottom-0 backdrop-blur-[2px] h-40 bg-gradient-to-b from-transparent via-[rgba(233,238,255,0.5)] to-[rgba(202,208,230,0.5)]">
            </div>

            <div className="w-full max-w-6xl text-center">
                <p className="animate-fade-up mb-4 text-sm font-semibold uppercase tracking-wide text-secondary" style={animationDelay(40)}>{heroDetails.eyebrow}</p>
                <h1 className="animate-fade-up text-4xl md:text-6xl md:leading-tight font-bold text-foreground max-w-lg md:max-w-3xl mx-auto" style={animationDelay(120)}>{heroDetails.heading}</h1>
                <p className="animate-fade-up mt-4 text-foreground-accent max-w-2xl mx-auto" style={animationDelay(200)}>{heroDetails.subheading}</p>
                <div className="animate-fade-up mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4" style={animationDelay(280)}>
                    <Link href={heroDetails.primaryCta.href} className="button-pop inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-black transition-colors hover:bg-primary-accent">
                        {heroDetails.primaryCta.text}
                        <HiArrowRight aria-hidden="true" />
                    </Link>
                    <Link href={heroDetails.secondaryCta.href} className="button-pop inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3 font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary">
                        {heroDetails.secondaryCta.text}
                    </Link>
                </div>

                <div className="animate-fade-up relative z-10 mx-auto mt-12 w-full max-w-5xl md:mt-16" style={animationDelay(380)}>
                    <div className="soft-glow animate-float-slow overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl">
                    <div className="flex flex-col gap-3 border-b border-gray-200 bg-hero-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-secondary">Document intake</p>
                            <p className="text-sm text-foreground-accent">AI extraction with staff review</p>
                        </div>
                        <div className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-foreground-accent">
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                            Ready for review
                        </div>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[1fr_0.75fr_1fr]">
                        <div className="p-5 md:p-7">
                            <p className="text-sm font-semibold uppercase tracking-wide text-foreground-accent">Input files</p>
                            <div className="mt-5 space-y-3">
                                {inputDocuments.map((documentName) => (
                                    <div key={documentName} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                                        <span className="font-semibold text-foreground">{documentName}</span>
                                        <span className="text-sm text-foreground-accent">Queued</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-y border-gray-200 bg-hero-background p-5 md:p-7 lg:border-x lg:border-y-0">
                            <p className="text-sm font-semibold uppercase tracking-wide text-foreground-accent">AI pass</p>
                            <div className="mt-5 space-y-4 text-sm text-foreground-accent">
                                <p className="rounded-xl bg-white p-4">Detects document type, tables, totals, customer fields, and low-confidence values.</p>
                                <p className="rounded-xl bg-white p-4">Routes uncertain fields to a human review step before export.</p>
                            </div>
                        </div>

                        <div className="p-5 md:p-7">
                            <p className="text-sm font-semibold uppercase tracking-wide text-foreground-accent">Structured output</p>
                            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
                                {extractedFields.map(([field, value]) => (
                                    <div key={field} className="grid grid-cols-[1fr_1.1fr] border-b border-gray-200 last:border-b-0">
                                        <span className="bg-hero-background px-4 py-3 font-mono text-sm text-foreground-accent">{field}</span>
                                        <span className="px-4 py-3 font-semibold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                                <span className="rounded-full bg-hero-background px-3 py-1 text-foreground-accent">Excel</span>
                                <span className="rounded-full bg-hero-background px-3 py-1 text-foreground-accent">JSON</span>
                                <span className="rounded-full bg-hero-background px-3 py-1 text-foreground-accent">Internal systems</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
