"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

type Theme = "light" | "dark";

type ThemeToggleProps = {
    compact?: boolean;
};

const storageKey = "kruzo-theme";

const applyTheme = (theme: Theme) => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = theme;
};

const getInitialTheme = (): Theme => {
    const storedTheme = localStorage.getItem(storageKey);

    if (storedTheme === "dark" || storedTheme === "light") {
        return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const initialTheme = getInitialTheme();
        setTheme(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);

    const nextTheme = theme === "dark" ? "light" : "dark";

    const toggleTheme = () => {
        setTheme(nextTheme);
        localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
    };

    return (
        <button
            type="button"
            className={clsx("theme-toggle button-pop", compact && "theme-toggle-compact")}
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
        >
            {theme === "dark" ? (
                <HiOutlineSun className="h-5 w-5" aria-hidden="true" />
            ) : (
                <HiOutlineMoon className="h-5 w-5" aria-hidden="true" />
            )}
            {!compact && (
                <span className="hidden text-sm font-semibold lg:inline">
                    {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;
