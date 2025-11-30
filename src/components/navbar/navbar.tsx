'use client'; // Ensure this is a client-side component

import { signOut } from "next-auth/react"; // Import signOut from NextAuth
import { useState, useEffect, useRef } from "react"; // Import useState, useEffect, and useRef
import { UserIcon, FolderIcon } from "@heroicons/react/24/outline"; // Import icons from Heroicons
import Link from "next/link"; // Import Link for navigation
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"; // Import SignOut icon from Heroicons
import Image from "next/image"; // Import Image for optimized image loading
import { useUser } from "@/contexts/UserContext"; // Import useUser hook
import { useAuth } from "@/hooks/useAuth"; // Import useAuth hook

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface NavBarProps {
  isLandingPage?: boolean;
}

const NavBar = ({ isLandingPage = false }: NavBarProps) => {
  const { clearUser } = useUser(); // Get clearUser function from context
  const { isAuthenticated, displayName, firstLetter, authMethod, isLoading } = useAuth(); // Get auth status and user info
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference for the dropdown to detect outside clicks

  const handleSignOut = () => {
    clearUser(); // Clear user data from context
    signOut({ callbackUrl: '/' }); // Clear NextAuth session and redirect
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close dropdown if clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={`w-full flex justify-between items-center px-6 py-4 shadow-md ${isLandingPage ? 'bg-[#080609]' : 'bg-black'}`}>
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/aeroml-icon.png"
          alt="AeroML Logo"
          width={45}
          height={45}
          priority
        />
        <span className="text-white font-bold text-lg">AEROML</span>
      </div>

      {/* Conditionally Render Content Based on Authentication */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          // Show loading state
          <div className="w-10 h-10 rounded-full bg-gray-600 animate-pulse"></div>
        ) : !isAuthenticated ? (
          // If not logged in, show the "Get Started" button
          <Link href="/auth/login">
            <button className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition cursor-pointer">
              Get Started
            </button>
          </Link>
        ) : (
          // If logged in, show the user's info and a sign-out button
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-bold cursor-pointer"
            >
              {firstLetter || '?'}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg text-white z-10"
                style={{ backgroundColor: "#1A1A1A" }} // Custom dark grey background color
              >
                {/* Item 1: User Icon + Display Name (Non-clickable) */}
                <div className="flex items-center p-3 cursor-default">
                  <UserIcon className="h-5 w-5 text-gray-300" />
                  <span className="ml-2 truncate">{displayName || 'User'}</span>
                </div>

                {/* Item 2: History Icon + "Model History" (Clickable) */}
                <div className="flex items-center p-3 hover:bg-[#424242] cursor-pointer">
                  <FolderIcon className="h-5 w-5 text-gray-300" />
                  <span className="ml-2">Model History</span>
                </div>

                {/* Item 3: Power Icon + "Sign Out" (Clickable) */}
                <div
                  onClick={handleSignOut}
                  className="flex items-center p-3 border-t border-gray-600 hover:bg-[#424242] cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon  className="h-5 w-5" /> {/* Using FontAwesomeIcon for Sign Out */}
                  <span className="ml-2">Sign Out</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
