'use client';

import { useState, useEffect } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loader from '@/components/loader/loader';

const SignUp = () => {
  // Added firstName and lastName to state
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [providers, setProviders] = useState<any>(null);
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

    if (credentials.password !== credentials.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // TODO: Implement backend signup logic here using firstName, lastName, username (email), password

    alert('Sign-up successful! Redirecting to sign-in page...');
    router.push('/auth/signin');
  };

  if (!providers) {
    return <Loader />;
  }

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{ background: 'linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)' }}
    >
      <div className="p-8 rounded-lg shadow-xl w-full sm:w-96">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/images/aeroml-icon.png" alt="AeroML Logo" width={85} height={85} priority />
        </div>
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Create Your Account</h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
                <input
                type="text"
                name="firstName"
                placeholder="First Name*"
                value={credentials.firstName}
                onChange={handleChange}
                className="w-[48%] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
                <input
                type="text"
                name="lastName"
                placeholder="Last Name*"
                value={credentials.lastName}
                onChange={handleChange}
                className="w-[48%] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="mb-4">
                <input
                type="email"
                name="username"
                placeholder="Email address*"
                value={credentials.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="mb-4">
                <input
                type="password"
                name="password"
                placeholder="Password*"
                value={credentials.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <div className="mb-6">
                <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password*"
                value={credentials.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            <button
                type="submit"
                className="w-full p-3 bg-white text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 cursor-pointer"
            >
                Sign Up
            </button>
        </form>

        <div className="flex items-center justify-center mb-4 mt-2">
          <p className="text-sm text-white">Already have an account?</p>
          <a href="/auth/signin" className="text-gray-500 ml-2">
            Sign in
          </a>
        </div>

        {/* Providers */}
        <div className="flex items-center justify-center mb-4">
          <div className="border-t border-gray-300 flex-grow mr-2"></div>
          <p className="text-sm text-white">Or Sign Up With:</p>
          <div className="border-t border-gray-300 flex-grow ml-2"></div>
        </div>

        <div className="space-y-2">
          {Object.values(providers).map((provider: any) => (
            <button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/model-prompt' })}
              className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-5 cursor-pointer"
            >
              {provider.name === 'Google' && <FontAwesomeIcon icon={faGoogle} className="text-white text-xl" />}
              Sign up with {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
