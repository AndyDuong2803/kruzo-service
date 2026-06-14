import clsx from "clsx";
import type React from "react";

type KruzoLogoProps = {
    variant?: "lockup" | "icon";
    className?: string;
    iconClassName?: string;
    textClassName?: string;
};

const KruzoLogo: React.FC<KruzoLogoProps> = ({
    variant = "lockup",
    className,
    iconClassName,
    textClassName,
}) => {
    const showWordmark = variant === "lockup";

    return (
        <span className={clsx("inline-flex items-center gap-2.5", className)}>
            <span className={clsx("logo-mark h-10 w-10 rounded-xl", iconClassName)} aria-hidden="true">
                <svg viewBox="0 0 48 48" className="h-8 w-8" role="img">
                    <path
                        d="M12 5.5h17.7L38 13.8v25.7c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4v-30c0-2.2 1.8-4 4-4Z"
                        fill="var(--logo-sheet)"
                        stroke="var(--logo-stroke)"
                        strokeWidth="2"
                    />
                    <path
                        d="M29.5 6.2v7.1c0 1.3 1 2.3 2.3 2.3h5.6"
                        fill="none"
                        stroke="var(--primary)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.4"
                    />
                    <path
                        d="M18 15.5v17"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="3"
                    />
                    <path
                        d="M31 15.5 20.5 24 31 32.5"
                        fill="none"
                        stroke="var(--primary)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3.6"
                    />
                    <path
                        d="M18.5 24h6"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="3"
                    />
                </svg>
            </span>

            {showWordmark && (
                <span className={clsx("manrope leading-none", textClassName)}>
                    <span className="block text-xl font-bold tracking-normal text-foreground">Kruzo</span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">Document AI</span>
                </span>
            )}
        </span>
    );
};

export default KruzoLogo;
