'use client';

import { useEffect, useState } from 'react';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSearchParams } from 'next/navigation';
import SourcesDropdownTextarea from '@/components/dataset_log_textarea/DataLogDropdownTextarea';
import DatasetSourcesList from '@/components/sources_textarea/DataLogDropdownTextarea';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Loader from '@/components/loader/loader';

export default function DatasetGeneration() {
    const router = useRouter();

    const handleBack = () => {
    //   router.push('/model-prompt');
        router.back(); // Go back to the previous page
    };

    const searchParams = useSearchParams();
    const rawData = searchParams ? searchParams.get('sourcesData') : null;
    interface SourcesData {
        summary?: string;
        sources?: any[];
    }

    const [sourcesData, setSourcesData] = useState<SourcesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const rawData = searchParams ? searchParams.get('sourcesData') : null;
        if (rawData) {
          try {
            const parsed = JSON.parse(decodeURIComponent(rawData));
            setSourcesData(parsed);
          } catch (err) {
            console.error("Invalid JSON in query:", err);
          }
        }
        setTimeout(() => {
          setIsLoading(false); // give it a bit of UX "smooth load"
        }, 600); // optional delay for fade-in effect
      }, [searchParams]);

      if (isLoading || !sourcesData) {
        return (
          <div className="flex flex-col min-h-screen bg-black text-white">
            <NavBar />
            <div className="flex-grow flex items-center justify-center">
              <Loader />
            </div>
            <Footer />
          </div>
        );
      }

    return (
        <div className="flex flex-col min-h-screen overflow-y-hidden bg-black">
            {/* Nav Bar */}
            <NavBar />
            <div>
            <section className="w-full max-w-5xl mx-auto px-4 py-16 text-white flex-grow">
                {/* Section Title */}
                <div className="mb-6">
                    <h4 className="text-xl text-gray-400 mb-2">Dataset Selection</h4>
                    <h2 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
                    Building Your Dataset
                    </h2>
                    <p className="text-gray-400 mb-10 mt-3 text-medium text-center sm:text-left">
                    {sourcesData?.summary?.replace(/^"(.*)"$/, '$1')}
                    </p>
                    {/* Dataset Log */}
                    <SourcesDropdownTextarea sourcesData={sourcesData?.sources || []} />
                    <br/>
                    {/* Dataset Sources List */}
                    <DatasetSourcesList sources={sourcesData?.sources || []} />
                </div>
                <div className="flex justify-between items-center w-full mt-6">
                    <button 
                        className="flex items-center gap-2 px-5 py-3 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition whitespace-nowrap cursor-pointer"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                    <button 
                        className="flex items-center gap-2 px-5 py-3 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition whitespace-nowrap cursor-pointer"
                        // onClick={handleContinue}
                    >
                        Continue <PaperPlaneIcon />
                    </button>
                </div>
            </section>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
