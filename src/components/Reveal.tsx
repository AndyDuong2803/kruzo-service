"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    threshold?: number;
}

const Reveal: React.FC<RevealProps> = ({
    children,
    className = "",
    delay = 0,
    threshold = 0.18,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) {
            return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                rootMargin: "0px 0px -8% 0px",
                threshold,
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`reveal ${isVisible ? "is-visible" : ""} ${className}`}
            style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

export default Reveal;
