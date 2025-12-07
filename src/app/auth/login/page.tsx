'use client';

import { useState, useEffect } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '@/components/loader/loader';
import { useUser } from '@/contexts/UserContext';
import { buildApiUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';

const SignIn = () => {
  const [providers, setProviders] = useState<any>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const fetchProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };

    fetchProviders();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/api/users/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const userData = await response.json();

      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        is_active: userData.is_active,
        created_at: userData.created_at,
      });

      router.push('/model-prompt');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!providers) {
    return <Loader />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)' }}>
      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/aeroml-icon.png"
            alt="AeroML Logo"
            width={64}
            height={64}
            priority
            className="mb-4"
          />
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="text-zinc-400 text-sm mt-2">Sign in to continue to AeroML</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-transparent border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full justify-center py-3 text-base font-medium cursor-pointer"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center justify-center mt-6 mb-6">
          <p className="text-sm text-zinc-400">Don't have an account? </p> 
          <a href="/auth/signup" className="text-white hover:underline ml-2 font-medium">Sign up</a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-zinc-800"></div>
          <span className="text-xs text-zinc-500 uppercase">Or continue with</span>
          <div className="h-px flex-1 bg-zinc-800"></div>
        </div>

        {/* Providers */}
        <div className="space-y-3">
          {Object.values(providers).map((provider: any) => (
            <Button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/model-prompt' })}
              variant="outline"
              className="w-full justify-center py-3 text-base font-medium border-zinc-700 hover:bg-zinc-800/50 hover:text-white transition-colors cursor-pointer"
            >
              {provider.name === "Google" && (
                <FontAwesomeIcon icon={faGoogle} className="mr-2 text-lg" />
              )}
              Continue with {provider.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignIn;