import Link from 'next/link';
import React from 'react';
import { HiArrowRight } from 'react-icons/hi2';

import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';
import { getPlatformIconByName } from '@/utils';
import KruzoLogo from './KruzoLogo';

const Footer: React.FC = () => {
    return (
        <footer className="relative overflow-hidden border-t border-border bg-hero-background text-foreground">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"></div>

            <div className="mx-auto w-full max-w-7xl px-6 py-10">
                <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-border bg-card-muted p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Start with a real workflow</p>
                        <p className="mt-2 text-2xl font-semibold md:text-3xl">{footerDetails.conversionLine}</p>
                    </div>

                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto xl:flex xl:flex-nowrap">
                        {footerDetails.ctaLinks.map((link, index) => (
                            <Link
                                key={link.text}
                                href={link.url}
                                className={index === 0
                                    ? "brand-button brand-button-primary button-pop min-h-11 justify-center gap-2 whitespace-nowrap px-5 py-2.5 text-sm"
                                    : "brand-button brand-button-secondary button-pop min-h-11 justify-center whitespace-nowrap px-5 py-2.5 text-sm"
                                }
                            >
                                {link.text}
                                {index === 0 && <HiArrowRight aria-hidden="true" />}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.9fr_1fr]">
                    <div>
                        <Link href="/" className="inline-flex transition-transform duration-200 hover:-translate-y-0.5">
                            <KruzoLogo iconClassName="h-9 w-9" />
                        </Link>
                        <p className="mt-3.5 max-w-sm text-muted">
                            {footerDetails.subheading}
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Product</h4>
                        <ul className="space-y-2">
                            {footerDetails.quickLinks.map(link => (
                                <li key={link.text}>
                                    <Link href={link.url} className="footer-link">{link.text}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Start Here</h4>

                        <ul className="space-y-2">
                            {footerDetails.ctaLinks.map(link => (
                                <li key={link.text}>
                                    <Link href={link.url} className="footer-link">{link.text}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Contact</h4>
                        <p className="max-w-sm text-muted">{footerDetails.contactText}</p>

                        {footerDetails.email && <a href={`mailto:${footerDetails.email}`}  className="footer-link mt-3">Email: {footerDetails.email}</a>}

                        {footerDetails.telephone && <a href={`tel:${footerDetails.telephone}`} className="footer-link mt-2">Phone: {footerDetails.telephone}</a>}

                        {footerDetails.socials && (
                            <div className="mt-5 flex flex-wrap items-center gap-5">
                                {Object.keys(footerDetails.socials).map(platformName => {
                                    if (platformName && footerDetails.socials[platformName]) {
                                        return (
                                            <Link
                                                href={footerDetails.socials[platformName]}
                                                key={platformName}
                                                aria-label={platformName}
                                                className="text-muted transition-colors hover:text-secondary"
                                            >
                                                {getPlatformIconByName(platformName)}
                                            </Link>
                                        )
                                    }
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 border-t border-border pt-6 text-sm text-muted md:text-center">
                    <p>Copyright &copy; {new Date().getFullYear()} {siteDetails.siteName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
