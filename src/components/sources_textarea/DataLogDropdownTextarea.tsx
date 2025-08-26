'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Globe } from 'lucide-react';

interface SourceItem {
  source: string;
  url: string;
  reason?: string;
}

interface ExpandableSourcesListProps {
  title?: string;
  sources: SourceItem[];
}

export default function ExpandableSourcesList({ title = "Dataset Sources", sources }: ExpandableSourcesListProps) {
  console.log(sources);
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border border-gray-600 rounded-md overflow-hidden bg-black text-white w-full">
      {/* Header */}
      <div
        onClick={toggleOpen}
        className="flex justify-between items-center px-4 py-3 cursor-pointer select-none"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {/* Expandable List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="source-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-4 pb-4 overflow-hidden"
          >
            {/* Scrollable list container */}
            <div className="max-h-70 overflow-y-auto space-y-4 pr-2 no-scrollbar">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border border-gray-700 rounded-md bg-black text-white"
                >
                  <Globe className="w-6 h-6 mt-1 text-white" />
                  <div>
                    <p className="font-medium text-medium">{source.source}</p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 text-sm hover:underline"
                    >
                      {source.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
