'use client'; // Ensure this is a client-side component

import { useState, useEffect } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';  // Import useRouter for navigation
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '@/components/loader/loader'; // Import your Loader component
import { useUser } from '@/contexts/UserContext'; // Import useUser hook
import { buildApiUrl } from '@/lib/api'; // Import API utility

const SignIn = () => {
  const [providers, setProviders] = useState<any>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();  // Initialize the router
  const { setUser } = useUser(); // Get setUser function from context

  // Fetch providers on component mount
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
      // Call the login API
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

      // Store user data in global context
      setUser({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        is_active: userData.is_active,
        created_at: userData.created_at,
      });

      // Redirect to model-prompt page
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
    return <Loader />; // Handle loading state
  }

  return (
    <div className="flex justify-center items-center min-h-screen" style={{ background: 'linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)' }}>
      <div className="p-8 rounded-lg shadow-xl w-full sm:w-96">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/aeroml-icon.png"
            alt="AeroML Logo"
            width={85}
            height={85}
            priority
          />
        </div>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Sign In Your Account</h2>
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email address*"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password*"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-center mb-4 mt-2">
          <p className="text-sm text-white">Don't have an account? </p> 
          <a href="/auth/signup" className="text-gray-500  ml-2">Sign up</a>
        </div>

        {/* Providers */}
        <div className="flex items-center justify-center mb-4">
          <div className="border-t border-gray-300 flex-grow mr-2"></div> {/* Left line */}
          <p className="text-sm text-white">Or Sign In With:</p>
          <div className="border-t border-gray-300 flex-grow ml-2"></div> {/* Right line */}
        </div>


        <div className="space-y-2">
          {Object.values(providers).map((provider: any) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/model-prompt' })}
              className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-5 cursor-pointer"
            >
              {/* FontAwesome Google Icon */}
              {provider.name === "Google" && (
                <FontAwesomeIcon icon={faGoogle} className="text-white text-xl" />
              )}
              {/* Text */}
              Sign in with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignIn;