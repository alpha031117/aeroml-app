import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "outline" | "primary";
    icon?: React.ReactNode;
}

export function Button({
    variant = "outline",
    icon,
    className = "",
    children,
    ...rest
}: ButtonProps) {
    const base =
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ring-offset-black";
    const styles = {
        ghost: "bg-transparent hover:bg-zinc-900 border border-transparent",
        outline:
            "border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200",
        primary: "bg-white hover:bg-gray-200 text-black border border-white",
    }[variant];
    
    return (
        <button className={`${base} ${styles} ${className}`} {...rest}>
            {icon}
            {children}
        </button>
    );
}
