'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import NavBar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import {
  Search,
  Home,
  BookOpen,
  ChevronRight,
  FileText,
  Upload,
  Brain,
  History,
  Download,
  Settings,
  Key,
  Info,
  Menu,
  X,
} from 'lucide-react';

// Force dynamic rendering to avoid prerender errors
export const dynamic = 'force-dynamic';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; type: 'section' | 'nav' }>>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navSections = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Overview', href: '#overview', icon: Home },
        { name: 'Quickstart', href: '#quickstart', icon: BookOpen },
        { name: 'Authentication', href: '#authentication', icon: Key },
      ],
    },
    {
      title: 'Core Features',
      items: [
        { name: 'Dataset Upload', href: '#dataset-upload', icon: Upload },
        { name: 'Model Training', href: '#model-training', icon: Brain },
        { name: 'Model History', href: '#model-history', icon: History },
        { name: 'Model Download', href: '#model-download', icon: Download },
      ],
    },
    {
      title: 'Guides',
      items: [
        { name: 'Best Practices', href: '#best-practices', icon: FileText },
        { name: 'Troubleshooting', href: '#troubleshooting', icon: Settings },
      ],
    },
  ];

  const onThisPage = [
    { id: 'overview', name: 'Overview' },
    { id: 'what-is-aeroml', name: 'What is AeroML?' },
    { id: 'quickstart', name: 'Quickstart' },
    { id: 'authentication', name: 'Authentication' },
    { id: 'dataset-upload', name: 'Dataset Upload' },
    { id: 'model-training', name: 'Model Training' },
    { id: 'model-history', name: 'Model History' },
    { id: 'model-download', name: 'Model Download' },
    { id: 'best-practices', name: 'Best Practices' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
  ];

  // Search functionality
  const searchContent = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: Array<{ id: string; name: string; type: 'section' | 'nav' }> = [];

    // Search in navigation items
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push({ id: item.href.replace('#', ''), name: item.name, type: 'nav' });
        }
      });
    });

    // Search in "On this page" items
    onThisPage.forEach((item) => {
      if (item.name.toLowerCase().includes(lowerQuery) && !results.find(r => r.id === item.id)) {
        results.push({ id: item.id, name: item.name, type: 'section' });
      }
    });

    setSearchResults(results);
  };

  // Handle search query change
  useEffect(() => {
    searchContent(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Close search on Escape
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        // Small delay to allow click on search results
        setTimeout(() => {
          const target = e.target as HTMLElement;
          if (!target.closest('.search-results')) {
            setSearchResults([]);
          }
        }, 100);
      }
    };

    if (searchQuery) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchQuery]);

  // Scroll to section when search result is clicked
  const handleSearchResultClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Track active section for right sidebar
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId || '');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen w-screen"
      style={{
        background: "linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)",
      }}
    >
      <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
        <NavBar />
      </Suspense>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-zinc-800 bg-zinc-900/30 h-[calc(100vh-5rem)] overflow-y-auto sticky top-20">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search docs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-zinc-500">Ctrl K</span>
              
              {/* Search Results Dropdown */}
              {searchQuery && searchResults.length > 0 && (
                <div className="search-results absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchResultClick(result.id)}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition flex items-center gap-2"
                    >
                      <Search size={14} className="text-zinc-500" />
                      <span>{result.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="search-results absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 p-4">
                  <p className="text-sm text-zinc-400">No results found</p>
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            {navSections.map((section, idx) => {
              // Filter items based on search query
              const filteredItems = searchQuery
                ? section.items.filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : section.items;

              if (filteredItems.length === 0 && searchQuery) return null;

              return (
                <div key={idx} className="mb-6">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">{section.title}</h3>
                  <ul className="space-y-1">
                    {filteredItems.map((item, itemIdx) => {
                      const Icon = item.icon;
                      const isHighlighted = searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase());
                      return (
                        <li key={itemIdx}>
                          <a
                            href={item.href}
                            className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-zinc-800/50 transition ${
                              isHighlighted
                                ? 'text-white bg-zinc-800/70 font-medium'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Icon size={16} />
                            {isHighlighted ? (
                              <span>
                                {item.name.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                  part.toLowerCase() === searchQuery.toLowerCase() ? (
                                    <mark key={i} className="bg-yellow-500/30 text-yellow-200">
                                      {part}
                                    </mark>
                                  ) : (
                                    part
                                  )
                                )}
                              </span>
                            ) : (
                              item.name
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-24 left-4 z-50 p-2 bg-zinc-800 rounded-lg text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 z-40 overflow-y-auto pt-20">
            <div className="p-4">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search docs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm"
                />
                
                {/* Search Results Dropdown for Mobile */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="search-results absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSearchResultClick(result.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition flex items-center gap-2"
                      >
                        <Search size={14} className="text-zinc-500" />
                        <span>{result.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && searchResults.length === 0 && (
                  <div className="search-results absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 p-4">
                    <p className="text-sm text-zinc-400">No results found</p>
                  </div>
                )}
              </div>
               {navSections.map((section, idx) => {
                 // Filter items based on search query
                 const filteredItems = searchQuery
                   ? section.items.filter((item) =>
                       item.name.toLowerCase().includes(searchQuery.toLowerCase())
                     )
                   : section.items;

                 if (filteredItems.length === 0 && searchQuery) return null;

                 return (
                   <div key={idx} className="mb-6">
                     <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">{section.title}</h3>
                     <ul className="space-y-1">
                       {filteredItems.map((item, itemIdx) => {
                         const Icon = item.icon;
                         const isHighlighted = searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase());
                         return (
                           <li key={itemIdx}>
                             <a
                               href={item.href}
                               onClick={() => setIsMobileMenuOpen(false)}
                               className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-zinc-800/50 transition ${
                                 isHighlighted
                                   ? 'text-white bg-zinc-800/70 font-medium'
                                   : 'text-zinc-400 hover:text-white'
                               }`}
                             >
                               <Icon size={16} />
                               {isHighlighted ? (
                                 <span>
                                   {item.name.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                                     part.toLowerCase() === searchQuery.toLowerCase() ? (
                                       <mark key={i} className="bg-yellow-500/30 text-yellow-200">
                                         {part}
                                       </mark>
                                     ) : (
                                       part
                                     )
                                   )}
                                 </span>
                               ) : (
                                 item.name
                               )}
                             </a>
                           </li>
                         );
                       })}
                     </ul>
                   </div>
                 );
               })}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 text-white">
          <div ref={contentRef}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">AeroML</p>
                  <h1 className="text-4xl font-bold">Documentation</h1>
                </div>
              </div>
              <p className="text-lg text-zinc-400">
                Learn how to build AI models with AeroML in {'<'} 5 minutes.
              </p>
            </div>

            {/* Overview Section */}
            <section id="overview" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Overview</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                AeroML is an innovative platform that makes machine learning accessible to everyone. 
                Build your own AI models using natural language, automate the entire ML lifecycle, 
                and deploy models with ease.
              </p>
            </section>

            {/* What is AeroML */}
            <section id="what-is-aeroml" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">What is AeroML?</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                AeroML is where automation meets innovation, making machine learning accessible to all. 
                Our platform enables you to build complete AI solutions using natural conversation, 
                from data preparation to model deployment.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Key Features</h3>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Smart Dataset Creation:</strong> Tell us what you&apos;re building, 
                      and our AI Agent will generate the perfect dataset for your model.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Model Intelligence:</strong> Get matched with the ideal model 
                      architecture through natural conversation.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <strong className="text-white">End-to-End Experience:</strong> Build complete AI solutions 
                      using natural conversation, from data to deployment.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Automated ML:</strong> Simplify and accelerate the machine learning 
                      lifecycle with minimal manual effort.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Model Download:</strong> Instantly generate and prepare downloadable 
                      models for local deployment.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                <Info className="text-blue-400 mt-0.5" size={20} />
                <div className="text-sm text-zinc-300">
                  <strong className="text-white">Powered By:</strong> AeroML leverages H2O.ai, OpenAI, and Groq AI 
                  to provide state-of-the-art machine learning capabilities.
                </div>
              </div>
            </section>

            {/* Quickstart */}
            <section id="quickstart" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Quickstart</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                Get started with AeroML in three simple steps:
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">Create an Account</h3>
                      <p className="text-zinc-300 mb-4">
                        Sign up for AeroML to get started. You can use email/password or sign in with Google OAuth.
                      </p>
                      <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Sign up now <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">Upload Your Dataset</h3>
                      <p className="text-zinc-300 mb-4">
                        Upload your dataset in CSV format. Our AI will validate and analyze your data, 
                        suggesting the best target variable and identifying any issues.
                      </p>
                      <Link
                        href="/dataset-upload"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Upload dataset <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/20 text-green-400 rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">Train Your Model</h3>
                      <p className="text-zinc-300 mb-4">
                        Configure your training parameters and let AeroML train your model. 
                        Monitor progress in real-time and download your trained model when complete.
                      </p>
                      <Link
                        href="/model-training"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Start training <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Authentication</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                AeroML supports multiple authentication methods for secure access to your account.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 mb-4">
                <div className="flex items-start gap-3">
                  <Key className="text-zinc-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Email/Password Authentication</h3>
                    <p className="text-zinc-300 mb-4">
                      Create an account using your email address and a secure password. Your credentials are 
                      encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Key className="text-zinc-400 mt-1" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Google OAuth</h3>
                    <p className="text-zinc-300">
                      Sign in quickly using your Google account. This method provides secure, one-click authentication 
                      without needing to remember passwords.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Dataset Upload */}
            <section id="dataset-upload" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Dataset Upload</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                Upload your dataset to start building your AI model. AeroML supports CSV files and automatically 
                validates your data.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold mb-3 text-white">Supported Formats</h3>
                <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                  <li>CSV files (.csv)</li>
                  <li>Maximum file size: 100MB</li>
                  <li>Must contain at least one target variable column</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3 mb-4">
                <Info className="text-blue-400 mt-0.5" size={20} />
                <div className="text-sm text-zinc-300">
                  <strong className="text-white">Data Validation:</strong> Our AI automatically analyzes your dataset, 
                  suggests the best target variable, identifies data quality issues, and detects potential data leakage.
                </div>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Upload Process</h3>
                <ol className="list-decimal list-inside text-zinc-300 space-y-2 ml-4">
                  <li>Navigate to the Dataset Upload page</li>
                  <li>Select or drag and drop your CSV file</li>
                  <li>Review the data preview</li>
                  <li>Provide a description of your ideal model output</li>
                  <li>Wait for validation to complete</li>
                  <li>Review validation results and proceed to training</li>
                </ol>
              </div>
            </section>

            {/* Model Training */}
            <section id="model-training" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Model Training</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                Train your model using AeroML&apos;s automated machine learning pipeline powered by H2O.ai.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold mb-3 text-white">Training Configuration</h3>
                <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                  <li><strong className="text-white">Target Variable:</strong> Automatically detected from your dataset</li>
                  <li><strong className="text-white">Excluded Columns:</strong> Automatically exclude leaky columns and irrelevant features</li>
                  <li><strong className="text-white">Training Time:</strong> Configurable maximum runtime</li>
                  <li><strong className="text-white">Model Selection:</strong> Automatic selection of best-performing models</li>
                </ul>
              </div>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Real-Time Monitoring</h3>
                <p className="text-zinc-300 mb-4">
                  Monitor your training progress in real-time with live logs and performance metrics. 
                  You&apos;ll see updates as the model trains, including:
                </p>
                <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                  <li>Training progress and status</li>
                  <li>Model performance metrics (AUC, LogLoss, etc.)</li>
                  <li>Feature importance rankings</li>
                  <li>Training logs and diagnostics</li>
                </ul>
              </div>
            </section>

            {/* Model History */}
            <section id="model-history" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Model History</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                View all your trained models in one place. Track performance, download models, and manage your ML projects.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Features</h3>
                <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                  <li>View all training sessions and their status</li>
                  <li>Access model performance metrics</li>
                  <li>Download trained models</li>
                  <li>View training history and logs</li>
                  <li>Filter and search through your models</li>
                </ul>
              </div>
            </section>

            {/* Model Download */}
            <section id="model-download" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Model Download</h2>
              <p className="text-zinc-300 leading-relaxed mb-6">
                Download your trained models for local deployment or integration into your applications.
              </p>

              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Download Options</h3>
                <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                  <li>Download complete model files</li>
                  <li>Access model artifacts and metadata</li>
                  <li>Get model performance reports</li>
                  <li>Export model configurations</li>
                </ul>
              </div>
            </section>

            {/* Best Practices */}
            <section id="best-practices" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Best Practices</h2>
              <div className="space-y-4">
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">Data Preparation</h3>
                  <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                    <li>Ensure your data is clean and well-structured</li>
                    <li>Remove or handle missing values appropriately</li>
                    <li>Use meaningful column names</li>
                    <li>Ensure your target variable is clearly defined</li>
                  </ul>
                </div>

                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">Model Training</h3>
                  <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                    <li>Review validation results before training</li>
                    <li>Exclude leaky columns identified during validation</li>
                    <li>Allow sufficient training time for complex datasets</li>
                    <li>Monitor training logs for any issues</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="mb-12">
              <h2 className="text-3xl font-semibold mb-4">Troubleshooting</h2>
              <div className="space-y-4">
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 text-white">Common Issues</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Upload Fails</h4>
                      <p className="text-zinc-300 text-sm">
                        Ensure your file is in CSV format and under 100MB. Check that the file is not corrupted.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Validation Errors</h4>
                      <p className="text-zinc-300 text-sm">
                        Review the validation results carefully. Address data quality issues and ensure your target 
                        variable is correctly identified.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Training Fails</h4>
                      <p className="text-zinc-300 text-sm">
                        Check the training logs for specific error messages. Ensure your dataset has sufficient 
                        data and the target variable is properly configured.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                  <Info className="text-blue-400 mt-0.5" size={20} />
                  <div className="text-sm text-zinc-300">
                    <strong className="text-white">Need Help?</strong> Contact us at{' '}
                    <a href="mailto:alphachongs@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
                      alphachongs@gmail.com
                    </a>
                    {' '}for support.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar - On This Page */}
        <aside className="hidden xl:block w-64 border-l border-zinc-800 bg-zinc-900/30 h-[calc(100vh-5rem)] overflow-y-auto sticky top-20">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Menu size={16} className="text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-400">On this page</h3>
            </div>
            <nav className="space-y-1">
              {(searchQuery
                ? onThisPage.filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : onThisPage
              ).map((item) => {
                const isHighlighted = searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block py-2 px-3 text-sm rounded transition ${
                      activeSection === item.id
                        ? 'text-white bg-zinc-800/50 font-medium'
                        : isHighlighted
                        ? 'text-white bg-zinc-800/30 font-medium'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                    }`}
                  >
                    {isHighlighted ? (
                      <span>
                        {item.name.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) =>
                          part.toLowerCase() === searchQuery.toLowerCase() ? (
                            <mark key={i} className="bg-yellow-500/30 text-yellow-200">
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </span>
                    ) : (
                      item.name
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}

