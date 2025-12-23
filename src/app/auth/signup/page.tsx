'use client';

import { useState, useEffect } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '@/components/loader/loader';
import { Button } from '@/components/ui/button';
import { buildApiUrl } from '@/lib/api';

const SignUp = () => {
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    username: '', // This will be the email
    password: '',
    confirmPassword: '',
  });
  const [providers, setProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    fetchProviders();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = buildApiUrl('/api/v1/users/');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
          full_name: `${credentials.firstName} ${credentials.lastName}`.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || 'Sign up failed');
      }

      // Redirect to login page with success query parameter
      router.push('/auth/login?signupSuccess=true');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setError(errorMessage);
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!providers) {
    return <Loader />;
  }

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{ background: 'linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)' }}
    >
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
          <h2 className="text-2xl font-semibold text-white">Create Your Account</h2>
          <p className="text-zinc-400 text-sm mt-2">Join AeroML and unleash your models</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={credentials.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-1/2 px-4 py-3 bg-transparent border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={credentials.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-1/2 px-4 py-3 bg-transparent border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <input
              type="email"
              name="username"
              placeholder="Email address"
              value={credentials.username}
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

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={credentials.confirmPassword}
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
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

        <div className="flex items-center justify-center mt-6 mb-6">
          <p className="text-sm text-zinc-400">Already have an account? </p>
          <a href="/auth/login" className="text-white hover:underline ml-2 font-medium">
            Sign in
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-zinc-800"></div>
          <span className="text-xs text-zinc-500 uppercase">Or sign up with</span>
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
              {provider.name === 'Google' && <FontAwesomeIcon icon={faGoogle} className="mr-2 text-lg" />}
              Sign up with {provider.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
