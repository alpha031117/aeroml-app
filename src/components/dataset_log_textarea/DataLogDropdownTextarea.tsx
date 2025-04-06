'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SourceItem {
  "Source Name": string;
  URL: string;
  topic?: string;
}

interface SourcesLogProps {
  sourcesData: {
    sources: SourceItem[];
  };
}

export default function SourcesLog({ sourcesData }: SourcesLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourcesText, setSourcesText] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (sourcesData?.sources?.length) {
      const text = sourcesData.sources
        .map(
          (source, index) =>{
            const timestamp = new Date().toLocaleTimeString('en-GB');
            return `${timestamp} - ${source["Source Name"]} - ${source.URL}`;
          }
        )
        .join('\n');
      setSourcesText(text);
    }
  }, [sourcesData]);

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-black text-white w-full">
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
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