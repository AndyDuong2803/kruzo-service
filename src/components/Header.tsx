'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3, HiOutlineDocumentText } from 'react-icons/hi2';
import clsx from 'clsx';

import Container from './Container';
import { siteDetails } from '@/data/siteDetails';
import { menuItems } from '@/data/menuItems';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const updateHeader = () => {
            setHasScrolled(window.scrollY > 12);
        };

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });

        return () => window.removeEventListener('scroll', updateHeader);
    }, []);

    return (
        <header
            className={clsx(
                "fixed top-0 left-0 right-0 z-50 mx-auto w-full border-b transition-all duration-300",
                hasScrolled
                    ? "border-gray-200/70 bg-white/85 shadow-sm backdrop-blur-xl"
                    : "border-transparent bg-white/95 md:bg-transparent"
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
                        <HiOutlineDocumentText className="text-foreground min-w-fit w-7 h-7" />
                        <span className="manrope text-xl font-semibold text-foreground cursor-pointer">
                            {siteDetails.siteName}
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex space-x-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="nav-link text-foreground hover:text-secondary transition-colors">
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/try" className="button-pop text-black bg-primary hover:bg-primary-accent px-8 py-3 rounded-full transition-colors">
                                Try Demo
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-primary text-black focus:outline-none rounded-full w-10 h-10 flex items-center justify-center"
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
                <div id="mobile-menu" className="md:hidden bg-white shadow-lg">
                    <ul className="flex flex-col space-y-4 pt-1 pb-6 px-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-foreground hover:text-primary block transition-colors" onClick={toggleMenu}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/try" className="button-pop text-black bg-primary hover:bg-primary-accent px-5 py-2 rounded-full block w-fit" onClick={toggleMenu}>
                                Try Demo
                            </Link>
                        </li>
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
