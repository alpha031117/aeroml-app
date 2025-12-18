'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
    LogOut,
    History,
    LayoutDashboard,
    BookOpen,  ChevronDown, User, Cog
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";

const NavBar = () => {
  const pathname = usePathname();
  const { clearUser } = useUser();
  const { isAuthenticated, displayName, firstLetter, isLoading } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Navigation Links Configuration
  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Model History', href: '/model-history', icon: History },
    { name: 'Documentation', href: '/documentation', icon: BookOpen },
  ];

  const handleSignOut = () => {
    clearUser();
    signOut({ callbackUrl: '/' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav 
        className={`
          sticky top-0 z-50 
          w-full px-6 py-3
          transition-all duration-300
          bg-black/80 backdrop-blur-md border-b border-white/10
        `}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* LEFT SECTION: Branding */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex items-center gap-2">
              <span className="relative w-8 h-8 transition-transform group-hover:scale-105 flex-shrink-0 flex items-center">
                <Image
                  src="/images/aeroml-icon.png"
                  alt="AeroML Logo"
                  width={32}
                  height={32}
                  priority
                />
              </span>
              <span className="text-white font-bold text-xl tracking-wide font-sans">
                AEROML
              </span>
            </span>
          </Link>

          {/* MIDDLE SECTION: Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                className={`
                  relative text-sm font-medium transition-all duration-200
                  ${isActive(link.href) 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'}
                `}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
              </Link>
            ))}
          </div>

          {/* RIGHT SECTION: User Actions */}
          <div className="flex items-center gap-5">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
            ) : !isAuthenticated ? (
              <Link href="/auth/login">
                <button className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/10">
                  Get Started
                </button>
              </Link>
            ) : (
              <>
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold border border-white/10 group-hover:border-white/30 transition-all">
                      {firstLetter || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-zinc-900 border border-zinc-800 overflow-hidden ring-1 ring-black/5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm text-white font-medium truncate">{displayName || 'User'}</p>
                        <p className="text-xs text-zinc-500">Pro Plan</p>
                      </div>
                      
                      <div className="p-1 border-t border-zinc-800">
                                                        {/* My Profile Link */}
                                                        <Link href="/my-profile" passHref legacyBehavior>
                                                          <button
                                                            onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                                          >
                                                            <User className="w-4 h-4" />
                                                            My Profile
                                                          </button>
                                                        </Link>
                                                        {/* LLM Configuration Link */}
                                                        <Link href="/llm-configuration" passHref legacyBehavior>
                                                          <button
                                                            onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                                          >
                                                            <Cog className="w-4 h-4" /> {/* Cog icon for settings */}
                                                            LLM Configuration
                                                          </button>
                                                        </Link>                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden text-white p-1"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isAuthenticated && (
        <div className="fixed inset-0 top-[65px] z-40 bg-black/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-5">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-all
                  ${isActive(link.href) ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}
                `}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
