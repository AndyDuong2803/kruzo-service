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
            className="section-anchor relative flex items-center justify-center px-5 pb-0 pt-32 md:pt-40"
        >
            <div className="absolute left-0 top-0 bottom-0 -z-10 w-full">
                <div className="brand-hero-grid absolute inset-0 h-full w-full">
                </div>
            </div>

            <div className="hero-bottom-fade absolute bottom-0 left-0 right-0 h-40 backdrop-blur-[2px]">
            </div>

            <div className="w-full max-w-6xl text-center">
                <p className="animate-fade-up mb-4 text-sm font-semibold uppercase tracking-wide text-secondary" style={animationDelay(40)}>{heroDetails.eyebrow}</p>
                <h1 className="animate-fade-up text-4xl md:text-6xl md:leading-tight font-bold text-foreground max-w-lg md:max-w-3xl mx-auto" style={animationDelay(120)}>{heroDetails.heading}</h1>
                <p className="animate-fade-up mt-4 text-muted max-w-2xl mx-auto" style={animationDelay(200)}>{heroDetails.subheading}</p>
                <div className="animate-fade-up mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4" style={animationDelay(280)}>
                    <Link href={heroDetails.primaryCta.href} className="brand-button brand-button-primary button-pop gap-2 px-7 py-3">
                        {heroDetails.primaryCta.text}
                        <HiArrowRight aria-hidden="true" />
                    </Link>
                    <Link href={heroDetails.secondaryCta.href} className="brand-button brand-button-secondary button-pop px-7 py-3">
                        {heroDetails.secondaryCta.text}
                    </Link>
                </div>

                <div className="animate-fade-up relative z-10 mx-auto mt-12 w-full max-w-5xl md:mt-16" style={animationDelay(380)}>
                    <div className="soft-glow animate-float-slow overflow-hidden rounded-2xl border border-border bg-card text-left shadow-2xl">
                    <div className="flex flex-col gap-3 border-b border-border bg-card-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-secondary">Document intake</p>
                            <p className="text-sm text-muted">AI extraction with staff review</p>
                        </div>
                        <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted">
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                            Ready for review
                        </div>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[1fr_0.75fr_1fr]">
                        <div className="p-5 md:p-7">
                            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Input files</p>
                            <div className="mt-5 space-y-3">
                                {inputDocuments.map((documentName) => (
                                    <div key={documentName} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                                        <span className="font-semibold text-foreground">{documentName}</span>
                                        <span className="text-sm text-muted">Queued</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-y border-border bg-card-muted p-5 md:p-7 lg:border-x lg:border-y-0">
                            <p className="text-sm font-semibold uppercase tracking-wide text-muted">AI pass</p>
                            <div className="mt-5 space-y-4 text-sm text-muted">
                                <p className="rounded-xl border border-border bg-card p-4">Detects document type, tables, totals, customer fields, and low-confidence values.</p>
                                <p className="rounded-xl border border-border bg-card p-4">Routes uncertain fields to a human review step before export.</p>
                            </div>
                        </div>

                        <div className="p-5 md:p-7">
                            <p className="text-sm font-semibold uppercase tracking-wide text-muted">Structured output</p>
                            <div className="mt-5 overflow-hidden rounded-xl border border-border">
                                {extractedFields.map(([field, value]) => (
                                    <div key={field} className="grid grid-cols-[1fr_1.1fr] border-b border-border last:border-b-0">
                                        <span className="bg-card-muted px-4 py-3 font-mono text-sm text-muted">{field}</span>
                                        <span className="px-4 py-3 font-semibold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                                <span className="rounded-full border border-border bg-card-muted px-3 py-1 text-muted">Excel</span>
                                <span className="rounded-full border border-border bg-card-muted px-3 py-1 text-muted">JSON</span>
                                <span className="rounded-full border border-border bg-card-muted px-3 py-1 text-muted">Internal systems</span>
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
