'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import { Button } from '@/components/ui';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { buildApiUrl } from '@/lib/api';

interface LLMConfig {
    id: string;
    model_name: string;
    max_runtime_secs: number;
    max_models?: number;
    stopping_rounds?: number;
    created_at: string;
    openai_api_key_masked: string;
}

export default function LLMConfiguration() {
    const { userId, isLoading: authLoading } = useAuth();
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gpt-4o-mini');
    const [maxModels, setMaxModels] = useState(1);
    const [stoppingRounds, setStoppingRounds] = useState(0);
    const [maxRuntimeSecs, setMaxRuntimeSecs] = useState(300);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingConfigId, setExistingConfigId] = useState<string | null>(null);
    const [hasExistingKey, setHasExistingKey] = useState(false);

    // Fetch existing LLM config on mount
    useEffect(() => {
        const fetchConfig = async () => {
            if (authLoading || !userId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    buildApiUrl(`/api/model-training/llm-configs?user_id=${userId}`)
                );

                if (!response.ok) {
                    // If 404, no config exists yet - that's okay
                    if (response.status === 404) {
                        setIsLoading(false);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: LLMConfig[] = await response.json();
                
                if (data && data.length > 0) {
                    const config = data[0]; // Use the first config if multiple exist
                    setExistingConfigId(config.id);
                    setModel(config.model_name);
                    setMaxRuntimeSecs(config.max_runtime_secs);
                    setMaxModels(config.max_models || 1);
                    setStoppingRounds(config.stopping_rounds || 0);
                    // Show masked API key if config exists
                    if (config.openai_api_key_masked) {
                        setApiKey('*********');
                        setHasExistingKey(true);
                    }
                }
            } catch (err) {
                console.error('Error fetching LLM config:', err);
                setError('Failed to load saved configuration');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, [userId, authLoading]);

    const handleSave = async () => {
        if (!userId) {
            setError('User authentication required. Please log in.');
            return;
        }

        // Determine if API key should be included in the request
        // Only require API key if there's no existing config
        // If there's an existing key and user hasn't changed it (still masked), don't include it
        const actualApiKey = hasExistingKey && apiKey === '*********' ? null : apiKey;
        
        // Only require API key if there's no existing config
        if (!hasExistingKey && (!actualApiKey || !actualApiKey.trim())) {
            setError('API key is required');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            // Build request body - only include API key if it's provided
            const requestBody: any = {
                user_id: userId,
                model_name: model,
                max_runtime_secs: maxRuntimeSecs,
                max_models: maxModels,
                stopping_rounds: stoppingRounds,
            };

            // Only include API key if user provided a new one
            if (actualApiKey && actualApiKey.trim()) {
                requestBody.openai_api_key = actualApiKey;
            }

            const response = await fetch(
                buildApiUrl('/api/model-training/llm-configs'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to save configuration' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const savedConfig = await response.json();
            setExistingConfigId(savedConfig.id || null);
            // Update API key display to show masked value after saving
            // If user provided a new key, mask it; if it was already masked, keep it masked
            setApiKey('*********');
            setHasExistingKey(true);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err) {
            console.error('Error saving LLM config:', err);
            setError(err instanceof Error ? err.message : 'Failed to save configuration. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-black text-white">
                <NavBar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <NavBar />
            <div className="flex-grow">
                <section className="w-full max-w-3xl mx-auto px-4 py-16">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-2">LLM Configuration</h1>
                        <p className="text-gray-400">Configure your Large Language Model settings and API keys.</p>
                    </div>

                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-8">
                        
                        {/* Service Provider */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Service Provider</h2>
                            <div className="flex gap-4 items-end">
                                <button
                                    onClick={() => setProvider('openai')}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        provider === 'openai' 
                                            ? 'bg-zinc-800 border-white ring-1 ring-white' 
                                            : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                                    }`}
                                >
                                    <div className="relative w-6 h-6">
                                        <Image 
                                            src="/images/openai-icon.png" 
                                            alt="OpenAI" 
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="font-medium">OpenAI</span>
                                </button>
                            </div>
                            <p className="text-zinc-500 text-sm mt-4">Other providers coming soon...</p>
                        </div>

                        {/* Configuration Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onFocus={(e) => {
                                        // Clear masked value when user focuses to enter new key
                                        if (hasExistingKey && apiKey === '*********') {
                                            setApiKey('');
                                            setHasExistingKey(false);
                                        }
                                    }}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        // If user starts typing, clear the hasExistingKey flag
                                        if (hasExistingKey && e.target.value !== '*********') {
                                            setHasExistingKey(false);
                                        }
                                    }}
                                    placeholder="sk-..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors placeholder-zinc-600"
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    {existingConfigId 
                                        ? 'Enter your API key to update the configuration. Your existing key is securely stored but cannot be displayed here.'
                                        : 'Your API key will be securely stored and used for model training operations.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                                <div className="relative">
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors appearance-none"
                                    >
                                        <option value="gpt-4">gpt-4</option>
                                        <option value="gpt-4-turbo">gpt-4-turbo</option>
                                        <option value="gpt-4o">gpt-4o</option>
                                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Models</label>
                                    <input
                                        type="number"
                                        value={maxModels}
                                        onChange={(e) => setMaxModels(parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">This field is to set maximum number of models trained per session.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Stopping Rounds</label>
                                    <input
                                        type="number"
                                        value={stoppingRounds}
                                        onChange={(e) => setStoppingRounds(parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">This field is to set maximum trial model to retry the training if there is fault.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Max Runtime (seconds)</label>
                                <input
                                    type="number"
                                    value={maxRuntimeSecs}
                                    onChange={(e) => setMaxRuntimeSecs(parseInt(e.target.value))}
                                    min="1"
                                    placeholder="300"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white transition-colors placeholder-zinc-600"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Maximum runtime in seconds for model training operations.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl text-sm flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="pt-6 border-t border-zinc-800 flex justify-end">
                            <Button 
                                variant="primary" 
                                onClick={handleSave}
                                disabled={isSaving || isLoading || !userId}
                                className="px-6"
                            >
                                {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Configuration'}
                            </Button>
                        </div>

                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
}
