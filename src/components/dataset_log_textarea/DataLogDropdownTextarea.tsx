'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToArray } from '@/lib/utils';

interface SourceItem {
  source: string;
  url: string;
  topic?: string;
}

interface SourcesLogProps {
  sourcesData: string | SourceItem[]; // sourcesData can be a JSON string or an array
}

export default function SourcesLog({ sourcesData }: SourcesLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourcesText, setSourcesText] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    // Check if sourcesData is a string (JSON string), and parse it if needed
    let parsedData = sourcesData;
    if (typeof sourcesData === 'string') {
      try {
        parsedData = JSON.parse(sourcesData); // Parse the JSON string into an array
      } catch (error) {
        console.error("Invalid JSON string", error);
        parsedData = []; // Fallback to empty array in case of invalid JSON
      }
    }

    // Now, parsedData will either be an array or an object with a sources key
    const sources = convertToArray(parsedData);
    console.log('Sources:', sources);

    if (sources.length) {
      const text = sources
        .map((source) => {
          // Only generate timestamp on client side to avoid hydration mismatch
          const timestamp = typeof window !== 'undefined' 
            ? new Date().toLocaleTimeString('en-GB')
            : '';
          return timestamp ? `${timestamp} - ${source.source} - ${source.url}` : `${source.source} - ${source.url}`;
        })
        .join('\n');
      setSourcesText(text);
    } else {
      setSourcesText('No log available');
    }
  }, [sourcesData]);

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-black text-white w-full no-scrollbar">
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer"
        onClick={toggleOpen}
      >
        <span className="font-medium">Dataset Log</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="px-4 overflow-hidden"
          >
            <textarea
              className="w-full h-70 mt-2 px-3 py-2 rounded-md bg-transparent border border-gray-600 text-white resize-none overflow-y-auto focus:outline-none"
              readOnly
              value={sourcesText}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
