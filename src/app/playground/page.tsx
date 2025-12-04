"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Download, Loader2 } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Button } from "@/components/ui/button";    
import { buildApiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import ProgressStepper from "@/components/ProgressStepper";

export default function Playground() {
    type Msg = { id: string; role: "user" | "assistant"; content: string };
    const [sessionId, setSessionId] = useState<string>('default');
    const { userId, isLoading: authLoading } = useAuth();
    const [isDownloading, setIsDownloading] = useState(false);

    // Start with empty array to avoid hydration mismatch
    // Initial message will be added in useEffect on client side only
    const [messages, setMessages] = useState<Msg[]>([]);
    
    // Initialize welcome message on client mount only
    useEffect(() => {
        setMessages([
            {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Hello! I'm your AI assistant. How can I help you today?",
            },
        ]);
    }, []);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [modelInfo, setModelInfo] = useState<{type?: string}>({});
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, isThinking]);

    // Extract session_id from URL on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const extractedSessionId = urlParams.get('session_id') || 'default';
            setSessionId(extractedSessionId);
        }
    }, []);

    // Fetch model info when sessionId is available
    useEffect(() => {
        if (sessionId === 'default') return; // Don't fetch if sessionId hasn't been extracted yet
        if (authLoading) return; // Wait for auth to load
        if (!userId) return; // Don't fetch if userId is not available
        
        const fetchModelInfo = async () => {
            try {
                const response = await fetch(buildApiUrl(`/api/model-training/model-info/${sessionId}?user_id=${userId}`));
                if (response.ok) {
                    const data = await response.json();
                    setModelInfo({
                        type: data.name || "Code Generator",
                    });
                }
            } catch (error) {
                console.error('Error fetching model info:', error);
                // Set default values if API call fails
                setModelInfo({
                    type: "Code Generator",
                });
            }
        };

        fetchModelInfo();
    }, [sessionId, userId, authLoading]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isThinking) return;
        if (!userId) {
            const errorReply: Msg = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "User authentication required. Please log in and try again.",
            };
            setMessages((m) => [...m, errorReply]);
            return;
        }

        const newUser: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
        setMessages((m) => [...m, newUser]);
        setInput("");
        setIsThinking(true);

        try {
            // Make API call to backend with extended timeout for H2O session initialization
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
            
            const response = await fetch(buildApiUrl(`/api/model-training/model-chat/${sessionId}?user_id=${userId}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: trimmed
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let responseContent = "No response received";
            
            try {
                const data = await response.json();
                console.log(data);
                
                // Handle different response formats
                if (typeof data === 'string') {
                    responseContent = data;
                } else if (data.bot_response) {
                    responseContent = data.bot_response;
                } else if (data.message) {
                    responseContent = data.message;
                } else if (data.response) {
                    responseContent = data.response;
                } else if (data.content) {
                    responseContent = data.content;
                } else if (data.text) {
                    responseContent = data.text;
                } else if (data.answer) {
                    responseContent = data.answer;
                } else {
                    // If it's an object, try to stringify it
                    responseContent = JSON.stringify(data);
                }
            } catch (jsonError) {
                console.error('Error parsing JSON response:', jsonError);
                // If JSON parsing fails, try to get text response
                try {
                    const textResponse = await response.text();
                    responseContent = textResponse || "Invalid response format received";
                } catch (textError) {
                    console.error('Error getting text response:', textError);
                    responseContent = "Error processing response from server";
                }
            }
            
            const reply: Msg = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: responseContent,
            };
            setMessages((m) => [...m, reply]);
        } catch (error) {
            console.error('Error sending message:', error);
            let errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";
            
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = "Request timed out. The H2O session initialization is taking longer than expected. Please try again.";
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = "Unable to connect to the server. Please check your connection and try again.";
                }
            }
            
            const errorReply: Msg = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: errorMessage,
            };
            setMessages((m) => [...m, errorReply]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleDownload = async () => {
        if (!userId || sessionId === 'default') {
            alert('Session ID or User ID is missing. Cannot download model.');
            return;
        }

        setIsDownloading(true);
        try {
            const response = await fetch(buildApiUrl(`/api/model-training/artifacts/download-model/${sessionId}?user_id=${userId}`), {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the blob from the response
            const blob = await response.blob();
            
            // Extract filename from Content-Disposition header or use a default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `model_${sessionId}.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create a download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading model:', error);
            alert('Failed to download model. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-neutral-100">
            {/* Top nav */}
            <NavBar />
            <ProgressStepper currentStep={4} />

            {/* Main layout */}
            <main className="flex-grow mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3">
                {/* Chat column */}
                <section className="lg:col-span-2">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                        <div
                            ref={listRef}
                            className="h-[60vh] overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 p-4 no-scrollbar"
                        >
                            {messages.map((m) => (
                                <ChatBubble key={m.id} role={m.role}>
                                    <CodeBlock text={m.content} />
                                </ChatBubble>
                            ))}

                            {isThinking && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-neutral-800/60 px-3 py-1 text-sm text-neutral-300">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Initializing H2O session and processing your request…
                                </div>
                            )}
                        </div>

                        {/* Input row */}
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Send a message…"
                                className="h-11 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isThinking}
                                className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 disabled:opacity-60 cursor-pointer"
                                title="Send"
                            >
                                {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sidebar */}
                <aside className="flex flex-col gap-6">
                    {/* Download Model */}
                    <Button 
                        variant="outline" 
                        className="cursor-pointer"
                        onClick={handleDownload}
                        disabled={isDownloading || !userId || sessionId === 'default'}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" /> Download Model
                            </>
                        )}
                    </Button>
                    {/* Suggestions */}
                    {/* <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
                        <div className="border-b border-neutral-800 p-4 text-sm font-semibold">Suggestions</div>
                        <ul className="divide-y divide-neutral-800">
                            {[
                                "Give me matplotlib code for parabola",
                                "Create a bar chart with sample data",
                                "Generate a scatter plot visualization",
                                "Make a line graph with multiple series",
                            ].map((s, i) => (
                                <li key={i}>
                                    <button
                                        className="flex w-full items-center gap-2 p-4 text-left text-sm text-neutral-300 hover:bg-neutral-800/50"
                                        onClick={() => setInput(s)}
                                    >
                                        <Sparkles className="h-4 w-4" /> {s}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                    {/* Model Info */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm">
                        <div className="mb-3 font-semibold">Model Info</div>
                        <div className="grid grid-cols-3 items-start gap-x-3 gap-y-2">
                            <div className="text-neutral-400">Status:</div>
                            <div className="col-span-2 text-emerald-400">Active</div>
                            <div className="text-neutral-400">Type:</div>
                            <div className="col-span-2">{modelInfo.type || "Loading..."}</div>
                            <div className="text-neutral-400">Session ID:</div>
                            <div className="col-span-2">{sessionId}</div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

function ChatBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
    const isUser = role === "user";
    return (
        <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[88%] rounded-lg border ${isUser
                        ? "border-neutral-800 bg-neutral-900/60"
                        : "border-neutral-800 bg-neutral-900/60"
                    } p-3 text-sm leading-relaxed`}
            >
                {children}
            </div>
        </div>
    );
}

function CodeBlock({ text }: { text: string }) {
    return (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-neutral-950 p-3 font-mono text-xs leading-5 text-neutral-200">
            {text}
        </pre>
    );
}


