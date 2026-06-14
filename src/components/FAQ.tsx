"use client"
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";
import Link from "next/link";
import { BiMinus, BiPlus } from "react-icons/bi";
import clsx from "clsx";

import SectionTitle from "./SectionTitle";
import { faqs } from "@/data/faq";
import Reveal from "./Reveal";

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="section-anchor pb-10 pt-12 lg:pb-20 lg:pt-16">
            <Reveal>
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="">
                    <p className="hidden text-sm font-semibold uppercase tracking-wide text-secondary lg:block">FAQ&apos;S</p>
                    <SectionTitle>
                        <h2 className="my-3 !leading-snug lg:max-w-sm text-center lg:text-left">Frequently Asked Questions</h2>
                    </SectionTitle>
                    <p className="text-center text-muted lg:mt-10 lg:text-left">
                        Have a document workflow to review?
                    </p>
                    <Link href="/#audit" className="mt-3 block text-center text-xl font-semibold text-secondary transition-colors hover:text-foreground lg:text-left lg:text-2xl">Get a free workflow audit</Link>
                </div>

                <div className="mx-auto w-full border-b border-border lg:max-w-2xl">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-7">
                            <Disclosure>
                                {({ open }) => (
                                    <>
                                        <DisclosureButton className="group flex w-full items-center justify-between border-t border-border px-4 pt-7 text-left text-lg transition-colors hover:text-secondary">
                                            <span className="text-2xl font-semibold">{faq.question}</span>
                                            <span className={clsx("ml-4 flex-shrink-0 text-secondary transition-transform duration-200", open ? "rotate-180" : "rotate-0")}>
                                                {open ? <BiMinus className="w-5 h-5" aria-hidden="true" /> : <BiPlus className="w-5 h-5" aria-hidden="true" />}
                                            </span>
                                        </DisclosureButton>
                                        <Transition
                                            show={open}
                                            enter="transition duration-200 ease-out"
                                            enterFrom="opacity-0 -translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition duration-150 ease-in"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 -translate-y-1"
                                        >
                                            <DisclosurePanel static className="px-4 pt-4 pb-2 text-muted">
                                                {faq.answer}
                                            </DisclosurePanel>
                                        </Transition>
                                    </>
                                )}
                            </Disclosure>
                        </div>
                    ))}
                </div>
            </div>
            </Reveal>
        </section>
    );
};

export default FAQ;
