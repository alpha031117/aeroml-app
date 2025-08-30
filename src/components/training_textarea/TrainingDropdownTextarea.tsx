'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hide scrollbar but keep scroll functionality
const scrollbarStyles = `
  .hidden-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .hidden-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface TrainingLog {
  id: string;
  timestamp: string;
  epoch: number;
  loss: number;
  accuracy: number;
  learningRate: number;
  status: 'running' | 'completed' | 'failed';
  message: string;
}

interface TrainingData {
  summary: string;
  modelName: string;
  datasetSize: number;
  trainingLogs: TrainingLog[];
  currentEpoch: number;
  totalEpochs: number;
  estimatedTimeRemaining: string;
}

interface TrainingDropdownTextareaProps {
  trainingData: TrainingData;
}

export default function TrainingDropdownTextarea({ trainingData }: TrainingDropdownTextareaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trainingText, setTrainingText] = useState('');

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (trainingData && trainingData.trainingLogs) {
      const text = trainingData.trainingLogs
        .map((log) => {
          const timestamp = new Date(log.timestamp).toLocaleString('en-GB');
          const status = log.status === 'running' ? '🔄' : log.status === 'completed' ? '✅' : '❌';
          const accuracyPercent = (log.accuracy * 100).toFixed(1);
          return `${timestamp} - Epoch ${log.epoch} - ${status} Loss: ${log.loss.toFixed(3)} | Acc: ${accuracyPercent}% | ${log.message}`;
        })
        .join('\n');
      setTrainingText(text);
    } else {
      setTrainingText('No training logs available');
    }
  }, [trainingData]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="border border-gray-600 rounded-md overflow-hidden bg-black text-white w-full no-scrollbar">
        <div
          className="flex justify-between items-center px-4 py-3 cursor-pointer"
          onClick={toggleOpen}
        >
          <span className="font-medium">Training Log</span>
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
                className="w-full h-70 mt-2 px-3 py-2 rounded-md bg-transparent border border-gray-600 text-white resize-none overflow-y-auto focus:outline-none hidden-scrollbar"
                readOnly
                value={trainingText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
