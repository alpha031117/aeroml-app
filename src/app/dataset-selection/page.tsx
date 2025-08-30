"use client";
import React, { useMemo, useRef, useState } from "react";
import Loader from "@/components/loader/loader";
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Icon, Button, StatCard, Badge, toCSV } from "@/components/ui";
import { DatasetRow, ApiResponse } from "@/types/dataset";
import Link from "next/link";

export default function Page() {
    // Custom scrollbar styles
    const scrollbarStyles = `
        .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #18181b;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46;
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #52525b;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
            background: #18181b;
        }
    `;
    const fileRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<DatasetRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status] = useState<"Ready" | "Training">("Ready");

    // Fetch data from API
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://127.0.0.1:80/datasets');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: ApiResponse = await response.json();
                setRows(result.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = useMemo(
        () => ({
            total: rows.length,
            features: 20, // Number of features in the dataset
            dataType: "Mixed",
        }),
        [rows]
    );

    function handleExport() {
        const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "dataset.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Please select a valid CSV file.');
            e.currentTarget.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = String(reader.result || "").trim();
                if (!text) {
                    alert('The selected file appears to be empty.');
                    return;
                }

                const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
                if (!header || lines.length === 0) {
                    alert('The CSV file must have a header row and at least one data row.');
                    return;
                }

                const cols = header.split(",").map((h) => h.trim().toLowerCase());
                const find = (k: string) => cols.indexOf(k);

                // Map CSV columns to DatasetRow properties
                const parsed: DatasetRow[] = lines.map((line, index) => {
                    const parts = line.split(",");
                    if (parts.length < cols.length) {
                        console.warn(`Row ${index + 1} has fewer columns than expected`);
                    }
                    
                    return {
                        customerID: parts[find("customer id")] || parts[find("customerid")] || `CUST_${index + 1}`,
                        gender: parts[find("gender")] || "Unknown",
                        SeniorCitizen: Number(parts[find("senior citizen")]) || 0,
                        Partner: parts[find("partner")] || "No",
                        Dependents: parts[find("dependents")] || "No",
                        tenure: Number(parts[find("tenure")]) || 0,
                        PhoneService: parts[find("phone service")] || parts[find("phoneservice")] || "No",
                        MultipleLines: parts[find("multiple lines")] || parts[find("multiplelines")] || "No",
                        InternetService: parts[find("internet service")] || parts[find("internetservice")] || "No",
                        OnlineSecurity: parts[find("online security")] || parts[find("onlinesecurity")] || "No",
                        OnlineBackup: parts[find("online backup")] || parts[find("onlinebackup")] || "No",
                        DeviceProtection: parts[find("device protection")] || parts[find("deviceprotection")] || "No",
                        TechSupport: parts[find("tech support")] || parts[find("techsupport")] || "No",
                        StreamingTV: parts[find("streaming tv")] || parts[find("streamingtv")] || "No",
                        StreamingMovies: parts[find("streaming movies")] || parts[find("streamingmovies")] || "No",
                        Contract: parts[find("contract")] || "Month-to-month",
                        PaperlessBilling: parts[find("paperless billing")] || parts[find("paperlessbilling")] || "No",
                        PaymentMethod: parts[find("payment method")] || parts[find("paymentmethod")] || "Electronic check",
                        MonthlyCharges: Number(parts[find("monthly charges")]) || 0,
                        TotalCharges: parts[find("total charges")] || "0",
                        Churn: parts[find("churn")] || "No",
                    };
                });

                if (parsed.length > 0) {
                    setRows(parsed);
                    setError(null); // Clear any previous errors
                    console.log(`Successfully imported ${parsed.length} rows from CSV file`);
                } else {
                    alert('No valid data rows found in the CSV file.');
                }
            } catch (err) {
                console.error("CSV parse error", err);
                alert("Couldn't parse CSV. Please ensure the file has the correct format with comma-separated values.");
            }
        };

        reader.onerror = () => {
            alert('Error reading the file. Please try again.');
        };

        reader.readAsText(file);
        // reset the input so the same file can be selected again
        e.currentTarget.value = "";
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-zinc-100">
                <NavBar />
                <div className="mx-auto max-w-7xl px-5 pb-16 pt-6">
                    <div className="flex items-center justify-center py-20">
                        <Loader />
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-black text-zinc-100">
                <NavBar />
                <div className="mx-auto max-w-7xl px-5 pb-16 pt-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h2>
                            <p className="text-zinc-400">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-zinc-100">
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            <NavBar />
            <div className="mx-auto max-w-7xl px-5 pb-16 pt-6">
                {/* Top bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="outline"
                            icon={<Icon.Upload />}
                            onClick={() => fileRef.current?.click()}
                            className="cursor-pointer"
                        >
                            Upload Own Dataset
                        </Button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImportCSV}
                            className="hidden"
                        />
                        <Button variant="outline" icon={<Icon.Download />} onClick={handleExport} className="cursor-pointer">
                            Export Dataset
                        </Button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Total Samples" value={stats.total} />
                    <StatCard label="Features" value={stats.features} />
                    <StatCard label="Data Type" pill={stats.dataType} />
                    <StatCard
                        label="Status"
                        pill={status}
                        pillColor={
                            status === "Ready"
                                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800"
                                : "bg-yellow-900/40 text-yellow-300 border border-yellow-800"
                        }
                    />
                </div>

                {/* Table */}
                <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="border-b border-zinc-800 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Training Data</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Preview of your dataset with customer information and churn prediction
                                </p>
                            </div>
                            {rows.length > 10 && (
                                <div className="text-sm text-zinc-400">
                                    Showing first 10 rows of {rows.length} total records
                                </div>
                            )}
                        </div>
                    </div>

                                         <div className="relative">
                         <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-sm min-w-max">
                                <thead>
                                    <tr className="text-zinc-400">
                                        {[
                                            "Customer ID",
                                            "Gender",
                                            "Senior Citizen",
                                            "Partner",
                                            "Dependents",
                                            "Tenure",
                                            "Phone Service",
                                            "Multiple Lines",
                                            "Internet Service",
                                            "Online Security",
                                            "Online Backup",
                                            "Device Protection",
                                            "Tech Support",
                                            "Streaming TV",
                                            "Streaming Movies",
                                            "Contract",
                                            "Paperless Billing",
                                            "Payment Method",
                                            "Monthly Charges",
                                            "Total Charges",
                                            "Churn",
                                        ].map((h) => (
                                            <th key={h} className="px-6 py-3 font-medium whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.slice(0, 10).map((r, i) => (
                                        <tr
                                            key={r.customerID + "_" + i}
                                            className="border-t border-zinc-800 hover:bg-zinc-900/40"
                                        >
                                            <td className="px-6 py-3 text-zinc-300 whitespace-nowrap">{r.customerID}</td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.gender}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                {r.SeniorCitizen ? "Yes" : "No"}
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.Partner}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.Dependents}</Badge>
                                            </td>
                                            <td className="px-6 py-3 tabular-nums text-zinc-100 whitespace-nowrap">
                                                {r.tenure}
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.PhoneService}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.MultipleLines}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.InternetService}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.OnlineSecurity}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.OnlineBackup}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.DeviceProtection}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.TechSupport}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.StreamingTV}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.StreamingMovies}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.Contract}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.PaperlessBilling}</Badge>
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge>{r.PaymentMethod}</Badge>
                                            </td>
                                            <td className="px-6 py-3 tabular-nums text-zinc-100 whitespace-nowrap">
                                                ${r.MonthlyCharges.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                ${r.TotalCharges}
                                            </td>
                                            <td className="px-6 py-3 text-zinc-100 whitespace-nowrap">
                                                <Badge
                                                    className={
                                                        r.Churn === "Yes"
                                                            ? "bg-red-900/40 text-red-300 border border-red-800"
                                                            : "bg-emerald-900/40 text-emerald-300 border border-emerald-800"
                                                    }
                                                >
                                                    {r.Churn}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                {/* Bottom buttons */}
                <div className="mt-5">
                    <div className="flex items-center justify-between">
                        <Link href="/model-prompt">
                            <Button variant="outline" className="cursor-pointer" icon={<Icon.Back />}>Reprompt to Generate</Button>
                        </Link>
                        <Button variant="primary" className="cursor-pointer" icon={<Icon.Play />}>Train Model</Button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
