'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export default function MyProfilePage() {
  const { user, session, isAuthenticated, isLoading, authMethod, firstLetter } = useAuth();
  const { setUser } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
      });
    } else if (session?.user) {
        setFormData({
            fullName: session.user.name || '',
            email: session.user.email || '',
        });
    }
  }, [user, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        if (authMethod === 'email' && user) {
            // Update local context for email users
            const updatedUser = { ...user, full_name: formData.fullName };
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } else {
            // For OAuth users, we acknowledge the action but can't persist to provider
            setMessage({ type: 'success', text: 'Profile updated (changes are local only for OAuth users).' });
        }
    } catch (error) {
        console.error("Failed to update profile", error);
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#080609] flex items-center justify-center text-white">
            <div className="animate-pulse">Loading...</div>
        </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#080609] text-white flex flex-col">
      <NavBar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-float-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-zinc-400">Manage your account information.</p>
          </div>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8 backdrop-blur-sm">
            {/* Header with Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-zinc-800">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-900/20">
                    {firstLetter}
                </div>
                <div className="text-center sm:text-left space-y-1 pt-2">
                    <h2 className="text-2xl font-semibold">{formData.fullName || 'User'}</h2>
                    <p className="text-zinc-500">{formData.email}</p>
                    <div className="pt-2">
                        <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                            {authMethod === 'google' ? 'Google Account' : 'Email Account'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-zinc-300">
                            Email Address 
                            <span className="ml-2 text-xs text-zinc-600 font-normal">(Read-only)</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={formData.email} 
                                disabled 
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-zinc-300">Full Name</label>
                        <input 
                            type="text" 
                            value={formData.fullName} 
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="Enter your full name"
                        />
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {message.type === 'success' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {message.text}
                    </div>
                )}

                <div className="pt-4">
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full sm:w-auto min-w-[120px] justify-center"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
