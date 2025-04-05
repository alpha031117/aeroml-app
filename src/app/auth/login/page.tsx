'use client'; // Ensure this is a client-side component

import { useState, useEffect } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';  // Import useRouter for navigation
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '@/components/loader/loader'; // Import your Loader component

const SignIn = () => {
  const [providers, setProviders] = useState<any>(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const router = useRouter();  // Initialize the router

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
    const result = await signIn('credentials', {
      username: credentials.username,
      password: credentials.password,
      callbackUrl: '/model-prompt',  // Set the redirect URL
    });

    // Optionally, check if the result is successful
    if (result?.ok) {
      router.push('/model-prompt');  // Manually navigate to /model-prompt
    } else {
      // Handle error or show message (optional)
      console.log('Login failed');
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
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          >
            Sign In
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
              className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-5"
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