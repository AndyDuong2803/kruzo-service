'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';
import clsx from 'clsx';

import Container from './Container';
import { menuItems } from '@/data/menuItems';
import KruzoLogo from './KruzoLogo';
import ThemeToggle from './ThemeToggle';

const appNavItems = [
    {
        text: "Excel Demo",
        url: "/try"
    },
    {
        text: "API Playground",
        url: "/try/api"
    },
    {
        text: "API Keys",
        url: "/api-keys"
    },
    {
        text: "Pricing",
        url: "/pricing"
    },
    {
        text: "Docs",
        url: "/docs"
    }
];

const getSectionIdFromUrl = (url: string) => {
    const hashIndex = url.indexOf('#');

    return hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
};

const trackedSectionIds = menuItems
    .map((item) => getSectionIdFromUrl(item.url))
    .filter(Boolean);

const Header: React.FC = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const isMarketingHeader = pathname === '/';

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNavClick = (url: string) => {
        const sectionId = getSectionIdFromUrl(url);

        if (sectionId) {
            setActiveSection(sectionId);
        }

        setIsOpen(false);
    };

    const isAppNavActive = (url: string) => {
        if (url === '/try') {
            return pathname === '/try';
        }

        return pathname === url || pathname.startsWith(`${url}/`);
    };

    useEffect(() => {
        const updateHeader = () => {
            setHasScrolled(window.scrollY > 12);

            if (!isMarketingHeader) {
                setActiveSection('');
                return;
            }

            const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 80;
            const activationLine = Math.min(window.innerHeight * 0.32, headerHeight + 96);
            let currentSection = '';

            for (const sectionId of trackedSectionIds) {
                const section = document.getElementById(sectionId);

                if (!section) {
                    continue;
                }

                const rect = section.getBoundingClientRect();

                if (rect.top <= activationLine && rect.bottom > activationLine) {
                    currentSection = sectionId;
                    break;
                }

                if (rect.top < activationLine) {
                    currentSection = sectionId;
                }
            }

            const firstSection = document.getElementById(trackedSectionIds[0]);

            if (firstSection && firstSection.getBoundingClientRect().top > activationLine) {
                currentSection = '';
            }

            setActiveSection(currentSection);
        };

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
        window.addEventListener('hashchange', updateHeader);

        return () => {
            window.removeEventListener('scroll', updateHeader);
            window.removeEventListener('hashchange', updateHeader);
        };
    }, [isMarketingHeader, pathname]);

    return (
        <header
            className={clsx(
                "site-header fixed left-0 right-0 top-0 z-50 mx-auto w-full border-b border-transparent transition-all duration-300",
                hasScrolled && "is-scrolled",
                isOpen && "is-open"
            )}
        >
            <Container className="!px-0">
                <nav
                    className={clsx(
                        "mx-auto flex items-center justify-between px-5 py-2 transition-all duration-300",
                        hasScrolled ? "md:py-4" : "md:py-8"
                    )}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5">
                        <KruzoLogo />
                    </Link>

                    {isMarketingHeader ? (
                        <div className="hidden items-center gap-4 lg:flex">
                            <ul className="flex items-center space-x-6">
                                {menuItems.map(item => (
                                    <li key={item.text}>
                                        <Link
                                            href={item.url}
                                            aria-current={activeSection === getSectionIdFromUrl(item.url) ? 'location' : undefined}
                                            className={clsx("nav-link", activeSection === getSectionIdFromUrl(item.url) && "is-active")}
                                            onClick={() => handleNavClick(item.url)}
                                        >
                                            {item.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ThemeToggle />
                            <Link href="/try" className="brand-button brand-button-primary button-pop px-6 py-2.5">
                                Try Demo
                            </Link>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-4 lg:flex">
                            <ul className="flex items-center space-x-4">
                                {appNavItems.map(item => (
                                    <li key={item.text}>
                                        <Link
                                            href={item.url}
                                            aria-current={isAppNavActive(item.url) ? 'page' : undefined}
                                            className={clsx("app-nav-link", isAppNavActive(item.url) && "is-active")}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ThemeToggle />
                            <Link href="/" className="brand-button brand-button-secondary button-pop px-5 py-2.5 text-sm">
                                Homepage
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <ThemeToggle compact />
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="brand-button brand-button-primary button-pop h-10 w-10 focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            {/* Mobile Menu with Transition */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div id="mobile-menu" className="site-mobile-menu border-t lg:hidden">
                    <ul className="flex flex-col space-y-4 pt-1 pb-6 px-6">
                        {isMarketingHeader ? (
                            <>
                                {menuItems.map(item => (
                                    <li key={item.text}>
                                        <Link
                                            href={item.url}
                                            aria-current={activeSection === getSectionIdFromUrl(item.url) ? 'location' : undefined}
                                            className={clsx("nav-link", activeSection === getSectionIdFromUrl(item.url) && "is-active")}
                                            onClick={() => handleNavClick(item.url)}
                                        >
                                            {item.text}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/try" className="brand-button brand-button-primary button-pop w-fit px-5 py-2" onClick={() => setIsOpen(false)}>
                                        Try Demo
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                {appNavItems.map(item => (
                                    <li key={item.text}>
                                        <Link
                                            href={item.url}
                                            aria-current={isAppNavActive(item.url) ? 'page' : undefined}
                                            className={clsx("app-nav-link", isAppNavActive(item.url) && "is-active")}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.text}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/" className="brand-button brand-button-secondary button-pop w-fit px-5 py-2" onClick={() => setIsOpen(false)}>
                                        Back to homepage
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
