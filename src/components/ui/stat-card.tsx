import React from "react";

interface StatCardProps {
    label: string;
    value?: React.ReactNode;
    pill?: string;
    pillColor?: string;
}

export function StatCard({
    label,
    value,
    pill,
    pillColor = "bg-zinc-800 text-zinc-200 border border-zinc-700",
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">{label}</p>
            {value ? (
                <div className="mt-2 text-2xl font-semibold text-zinc-100">{value}</div>
            ) : null}
            {pill ? (
                <div
                    className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs ${pillColor}`}
                >
                    {pill}
                </div>
            ) : null}
        </div>
    );
}
