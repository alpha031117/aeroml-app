import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
    return (
        <span className={`inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200 ${className}`}>
            {children}
        </span>
    );
}
