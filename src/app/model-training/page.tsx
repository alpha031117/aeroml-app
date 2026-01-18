'use client';

import { useEffect, useState, Suspense } from 'react';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useSearchParams, useRouter } from 'next/navigation';
import TrainingDropdownTextarea from '@/components/training_textarea/TrainingDropdownTextarea';
import Loader from '@/components/loader/loader';
import { Button } from '@/components/ui';
import { Bot, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import ProgressStepper from "@/components/ProgressStepper";

// Extend Window interface for global file storage
declare global {
  interface Window {
    aeromlRawFile?: File;
    aeromlFileKey?: string;
  }
}

// Define the training log interface
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

// Define the minimal dataset data interface from previous page
interface LeakyColumn {
  column_name: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface MinimalDatasetData {
  prompt: string;
  fileInfo: {
    name: string;
    size: string;
    rows: number;
    columns: number;
  };
  validation: {
    status: string;
    dataset_info: {
      filename: string;
      num_rows: number;
      num_columns: number;
      columns: string[];
      missing_values: Record<string, number>;
    };
    validation: {
      is_valid: boolean;
      confidence_score: number;
      validation_message: string;
      recommendations: string[];
      potential_issues: string[];
      suggested_target_column: string;
      suggested_preprocessing: string[];
      leaky_columns?: LeakyColumn[];
      columns_to_exclude?: string[];
      safe_columns?: string[];
    };
  };
  targetColumn: string;
}

// Define the training data interface
interface TrainingData {
  summary: string;
  modelName: string;
  datasetSize: number;
  trainingLogs: TrainingLog[];
  currentEpoch: number;
  totalEpochs: number;
  estimatedTimeRemaining: string;
  datasetInfo?: MinimalDatasetData; // Add dataset info to training data
}

// Dummy training data - moved outside component to avoid recreation on every render
const dummyTrainingData: TrainingData = {
        summary: "Training a custom language model on aerospace engineering data with 10,000 samples",
        modelName: "AeroML-v1.0",
        datasetSize: 10000,
        currentEpoch: 15,
        totalEpochs: 50,
        estimatedTimeRemaining: "2 hours 30 minutes",
        trainingLogs: [
            {
                id: "1",
                timestamp: "2024-01-15T10:30:00Z",
                epoch: 1,
                loss: 2.456,
                accuracy: 0.234,
                learningRate: 0.001,
                status: 'completed',
                message: "Initial training started"
            },
            {
                id: "2",
                timestamp: "2024-01-15T10:35:00Z",
                epoch: 2,
                loss: 2.123,
                accuracy: 0.312,
                learningRate: 0.001,
                status: 'completed',
                message: "Loss decreasing steadily"
            },
            {
                id: "3",
                timestamp: "2024-01-15T10:40:00Z",
                epoch: 3,
                loss: 1.987,
                accuracy: 0.389,
                learningRate: 0.001,
                status: 'completed',
                message: "Model learning patterns"
            },
            {
                id: "4",
                timestamp: "2024-01-15T10:45:00Z",
                epoch: 4,
                loss: 1.756,
                accuracy: 0.445,
                learningRate: 0.001,
                status: 'completed',
                message: "Accuracy improving"
            },
            {
                id: "5",
                timestamp: "2024-01-15T10:50:00Z",
                epoch: 5,
                loss: 1.623,
                accuracy: 0.512,
                learningRate: 0.001,
                status: 'completed',
                message: "Good progress on validation set"
            },
            {
                id: "6",
                timestamp: "2024-01-15T10:55:00Z",
                epoch: 6,
                loss: 1.489,
                accuracy: 0.578,
                learningRate: 0.001,
                status: 'completed',
                message: "Model converging well"
            },
            {
                id: "7",
                timestamp: "2024-01-15T11:00:00Z",
                epoch: 7,
                loss: 1.345,
                accuracy: 0.634,
                learningRate: 0.001,
                status: 'completed',
                message: "Performance metrics improving"
            },
            {
                id: "8",
                timestamp: "2024-01-15T11:05:00Z",
                epoch: 8,
                loss: 1.234,
                accuracy: 0.689,
                learningRate: 0.001,
                status: 'completed',
                message: "Model showing good generalization"
            },
            {
                id: "9",
                timestamp: "2024-01-15T11:10:00Z",
                epoch: 9,
                loss: 1.123,
                accuracy: 0.734,
                learningRate: 0.001,
                status: 'completed',
                message: "Training progressing smoothly"
            },
            {
                id: "10",
                timestamp: "2024-01-15T11:15:00Z",
                epoch: 10,
                loss: 1.045,
                accuracy: 0.778,
                learningRate: 0.001,
                status: 'completed',
                message: "Reached 20% completion"
            },
            {
                id: "11",
                timestamp: "2024-01-15T11:20:00Z",
                epoch: 11,
                loss: 0.987,
                accuracy: 0.812,
                learningRate: 0.001,
                status: 'completed',
                message: "Accuracy above 80%"
            },
            {
                id: "12",
                timestamp: "2024-01-15T11:25:00Z",
                epoch: 12,
                loss: 0.934,
                accuracy: 0.845,
                learningRate: 0.001,
                status: 'completed',
                message: "Model performance stable"
            },
            {
                id: "13",
                timestamp: "2024-01-15T11:30:00Z",
                epoch: 13,
                loss: 0.876,
                accuracy: 0.867,
                learningRate: 0.001,
                status: 'completed',
                message: "Loss continuing to decrease"
            },
            {
                id: "14",
                timestamp: "2024-01-15T11:35:00Z",
                epoch: 14,
                loss: 0.823,
                accuracy: 0.889,
                learningRate: 0.001,
                status: 'completed',
                message: "Approaching 90% accuracy"
            },
            {
                id: "15",
                timestamp: "2024-01-15T11:40:00Z",
                epoch: 15,
                loss: 0.789,
                accuracy: 0.901,
                learningRate: 0.001,
                status: 'running',
                message: "Currently training epoch 15..."
            }
        ]
};

// Force dynamic rendering to avoid prerender errors with useSearchParams
export const dynamic = 'force-dynamic';

function ModelTrainingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { userId, isAuthenticated, isLoading: authLoading, authMethod } = useAuth(); // Use useAuth hook to get userId from both auth methods
    const [isLoading, setIsLoading] = useState(true);
    const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
    const [datasetData, setDatasetData] = useState<MinimalDatasetData | null>(null);
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
    const [trainingStatus, setTrainingStatus] = useState<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Check for dataset data from dataset-upload page
        const dataKeyParam = searchParams ? searchParams.get('dataKey') : null;
        const fileKeyParam = searchParams ? searchParams.get('fileKey') : null;
        const datasetDataParam = searchParams ? searchParams.get('datasetData') : null;
        const sourcesDataParam = searchParams ? searchParams.get('sourcesData') : null;
        
        if (dataKeyParam) {
          // New method: Read minimal data from sessionStorage
          try {
            const storedData = sessionStorage.getItem(dataKeyParam);
            if (storedData) {
              const parsedDataset: MinimalDatasetData = JSON.parse(storedData);
              setDatasetData(parsedDataset);
              
              // Get the raw file from global variable
              if (typeof window !== 'undefined' && window.aeromlRawFile) {
                setRawFile(window.aeromlRawFile);
                // Clean up global variable
                delete window.aeromlRawFile;
                delete window.aeromlFileKey;
              }
              
              // Create training data based on real dataset
              const realTrainingData: TrainingData = {
                summary: `Training a machine learning model on ${parsedDataset.fileInfo.name} with ${parsedDataset.fileInfo.rows.toLocaleString()} samples for: ${parsedDataset.prompt}`,
                modelName: `AeroML-${parsedDataset.fileInfo.name.split('.')[0]}`,
                datasetSize: parsedDataset.fileInfo.rows,
                currentEpoch: 1,
                totalEpochs: Math.min(50, Math.max(10, Math.floor(parsedDataset.fileInfo.rows / 1000))), // Dynamic epochs based on dataset size
                estimatedTimeRemaining: "Calculating...",
                trainingLogs: [
                  {
                    id: "1",
                    timestamp: new Date().toISOString(),
                    epoch: 1,
                    loss: 0.0,
                    accuracy: 0.0,
                    learningRate: 0.001,
                    status: 'running',
                    message: `Starting training with ${parsedDataset.fileInfo.name}...`
                  }
                ],
                datasetInfo: parsedDataset
              };
              
              setTrainingData(realTrainingData);
              
              // Clean up sessionStorage after use
              sessionStorage.removeItem(dataKeyParam);
              if (fileKeyParam) {
                sessionStorage.removeItem(fileKeyParam);
              }
            } else {
              console.warn("No data found in sessionStorage for key:", dataKeyParam);
              setTrainingData(dummyTrainingData);
            }
          } catch (err) {
            console.error("Error reading dataset from sessionStorage:", err);
            // Fallback to dummy data
            setTrainingData(dummyTrainingData);
          }
        } else if (datasetDataParam) {
          // Legacy method: Read from URL (kept for backward compatibility)
          try {
            const parsedDataset: MinimalDatasetData = JSON.parse(decodeURIComponent(datasetDataParam)) as MinimalDatasetData;
            setDatasetData(parsedDataset);
            
            // Create training data based on real dataset
            const realTrainingData: TrainingData = {
              summary: `Training a machine learning model on ${parsedDataset.fileInfo.name} with ${parsedDataset.fileInfo.rows.toLocaleString()} samples for: ${parsedDataset.prompt}`,
              modelName: `AeroML-${parsedDataset.fileInfo.name.split('.')[0]}`,
              datasetSize: parsedDataset.fileInfo.rows,
              currentEpoch: 1,
              totalEpochs: Math.min(50, Math.max(10, Math.floor(parsedDataset.fileInfo.rows / 1000))), // Dynamic epochs based on dataset size
              estimatedTimeRemaining: "Calculating...",
              trainingLogs: [
                {
                  id: "1",
                  timestamp: new Date().toISOString(),
                  epoch: 1,
                  loss: 0.0,
                  accuracy: 0.0,
                  learningRate: 0.001,
                  status: 'running',
                  message: `Starting training with ${parsedDataset.fileInfo.name}...`
                }
              ],
              datasetInfo: parsedDataset
            };
            
            setTrainingData(realTrainingData);
          } catch (err) {
            console.error("Invalid dataset JSON in query:", err);
            // Fallback to dummy data
            setTrainingData(dummyTrainingData);
          }
        } else if (sourcesDataParam) {
          try {
            JSON.parse(decodeURIComponent(sourcesDataParam));
            // For now, use dummy data instead of parsed sources data
            setTrainingData(dummyTrainingData);
          } catch (err) {
            console.error("Invalid sources JSON in query:", err);
            // Fallback to dummy data
            setTrainingData(dummyTrainingData);
          }
        } else {
          // No query params, use dummy data
          setTrainingData(dummyTrainingData);
        }
        
        setTimeout(() => {
          setIsLoading(false); // give it a bit of UX "smooth load"
        }, 600); // optional delay for fade-in effect
      }, [searchParams]); // dummyTrainingData is constant, doesn't need to be in deps

    const startTraining = async () => {
        if (!datasetData || !rawFile) {
            alert('No dataset data or file available. Please go back and upload a dataset.');
            return;
        }
        
        // Wait for auth to finish loading
        if (authLoading) {
            alert('Please wait while we verify your authentication...');
            return;
        }
        
        if (!isAuthenticated || !userId) {
            console.error('Authentication check failed:', { isAuthenticated, userId, authMethod });
            alert('No authenticated user found. Please sign in again before starting training.');
            router.push('/auth/login');
            return;
        }

        setIsTraining(true);
        setTrainingStatus('starting');
        setTrainingLogs([]);

        try {
            // Collect excluded columns from both leaky_columns and columns_to_exclude
            const excludedColumns: string[] = [];
            
            // Add columns from leaky_columns (if any)
            if (datasetData.validation.validation.leaky_columns) {
                excludedColumns.push(...datasetData.validation.validation.leaky_columns.map(col => col.column_name));
            }
            
            // Add columns from columns_to_exclude (if any)
            if (datasetData.validation.validation.columns_to_exclude) {
                excludedColumns.push(...datasetData.validation.validation.columns_to_exclude);
            }
            
            // Remove duplicates
            const uniqueExcludedColumns = Array.from(new Set(excludedColumns));

            // Use the original raw file directly
            const formData = new FormData();
            formData.append('file', rawFile, datasetData.fileInfo.name);
            formData.append('target_variable', datasetData.targetColumn || '');
            formData.append('user_id', userId);
            
            // Add excluded columns as comma-separated string if there are any
            if (uniqueExcludedColumns.length > 0) {
                const excludeColumnsString = uniqueExcludedColumns.join(',');
                formData.append('exclude_columns', excludeColumnsString);
                console.log('Excluded columns:', uniqueExcludedColumns);
            }

            console.log('Starting training with target variable:', datasetData.targetColumn);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/model-training/run-h2o-ml-pipeline-advanced`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setTrainingStatus('running');

            // Handle streaming response for real-time logs
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let buffer = '';
                
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        setTrainingStatus('completed');
                        
                        // Automatically extract session ID after completion
                        if (!sessionId) {
                            // First try to extract from the final buffer using multiple patterns
                            let sessionMatch = buffer.match(/Session ID:\s*([a-f0-9-]{36})/i);
                            if (!sessionMatch) {
                                sessionMatch = buffer.match(/session_data[\\\/]([a-f0-9-]{36})/);
                            }
                            if (!sessionMatch) {
                                sessionMatch = buffer.match(/"session_id":\s*"([a-f0-9-]{36})"/);
                            }
                            if (!sessionMatch) {
                                sessionMatch = buffer.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                            }
                            
                            if (sessionMatch) {
                                setSessionId(sessionMatch[1]);
                                console.log('Extracted session ID from final buffer:', sessionMatch[1]);
                            } else {
                                // Try to extract from existing training logs
                                setTimeout(() => {
                                    setTrainingLogs(currentLogs => {
                                        for (const log of currentLogs) {
                                            const uuidMatch = log.message.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                                            if (uuidMatch) {
                                                setSessionId(uuidMatch[1]);
                                                console.log('Auto-extracted session ID from logs:', uuidMatch[1]);
                                                return currentLogs;
                                            }
                                        }
                                        
                                        // If still no session ID found, generate a fallback
                                        const fallbackId = `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                                        setSessionId(fallbackId);
                                        console.log('Generated fallback session ID:', fallbackId);
                                        return currentLogs;
                                    });
                                }, 100); // Small delay to ensure logs are updated
                            }
                        }
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.trim()) {
                            // Try to extract session ID from any line immediately
                            if (!sessionId) {
                                const uuidMatch = line.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                                if (uuidMatch) {
                                    setSessionId(uuidMatch[1]);
                                    console.log('Extracted session ID from any line:', uuidMatch[1]);
                                }
                            }
                            
                            try {
                                const logEntry = JSON.parse(line) as {
                                    session_id?: string;
                                    sessionId?: string;
                                    session?: string;
                                    id?: string;
                                    epoch?: number;
                                    loss?: number;
                                    accuracy?: number;
                                    learning_rate?: number;
                                    message?: string;
                                };
                                
                                // Extract session_id if present in the log entry (FINAL_RESULT format)
                                if (logEntry.session_id) {
                                    setSessionId(logEntry.session_id);
                                    console.log('Training session ID from JSON:', logEntry.session_id);
                                }
                                
                                // Also check for session_id in different possible locations
                                if (!sessionId && (logEntry.sessionId || logEntry.session || logEntry.id)) {
                                    const extractedId = logEntry.sessionId || logEntry.session || logEntry.id || null;
                                    setSessionId(extractedId);
                                    console.log('Extracted session ID from alternative field:', extractedId);
                                }
                                
                                const newLog: TrainingLog = {
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                    timestamp: new Date().toISOString(),
                                    epoch: logEntry.epoch || 0,
                                    loss: logEntry.loss || 0,
                                    accuracy: logEntry.accuracy || 0,
                                    learningRate: logEntry.learning_rate || 0.001,
                                    status: 'running',
                                    message: logEntry.message || line
                                };
                                
                                setTrainingLogs(prev => [...prev, newLog]);
                            } catch {
                                // If not JSON, treat as plain text log and try to extract session ID
                                
                                // Extract session ID from various formats in the log line
                                if (!sessionId) {
                                    let sessionMatch = null;
                                    
                                    // Format 1: "LOG: Session ID: 985fe90b-c928-4357-aaf3-868045a6f7c4"
                                    if (line.includes('Session ID:')) {
                                        sessionMatch = line.match(/Session ID:\s*([a-f0-9-]{36})/i);
                                    }
                                    
                                    // Format 2: "session_data\65924f44-9c2e-4fc2-82e4-0b1ffcc5e5d2\"
                                    if (!sessionMatch && line.includes('session_data')) {
                                        sessionMatch = line.match(/session_data[\\\/]([a-f0-9-]{36})/);
                                    }
                                    
                                    // Format 3: Any UUID pattern in the line
                                    if (!sessionMatch) {
                                        sessionMatch = line.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                                    }
                                    
                                    if (sessionMatch) {
                                        setSessionId(sessionMatch[1]);
                                        console.log('Extracted session ID from line:', sessionMatch[1], 'from:', line);
                                    }
                                }
                                
                                const newLog: TrainingLog = {
                                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                    timestamp: new Date().toISOString(),
                                    epoch: 0,
                                    loss: 0,
                                    accuracy: 0,
                                    learningRate: 0,
                                    status: 'running',
                                    message: line
                                };
                                
                                setTrainingLogs(prev => [...prev, newLog]);
                            }
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error starting training:', error);
            setTrainingStatus('failed');
            const errorLog: TrainingLog = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                epoch: 0,
                loss: 0,
                accuracy: 0,
                learningRate: 0,
                status: 'failed',
                message: `Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
            setTrainingLogs(prev => [...prev, errorLog]);
        } finally {
            setIsTraining(false);
        }
    };

    const handleModelReport = () => {
        if (sessionId) {
            // Navigate directly to model-detail, same as from model history rows
            router.push(`/model-detail?session_id=${sessionId}`);
        } else {
            alert('No session ID available. Please complete training first.');
        }
    };

    const handleAIEnhancement = () => {
        if (sessionId) {
            router.push(`/model-enhancement?session_id=${sessionId}`);
        } else {
            alert('No session ID available. Please complete training first.');
        }
    };


    const handleDeployModel = () => {
        if (sessionId) {
            router.push(`/playground?session_id=${sessionId}`);
        } else {
            alert('No session ID available. Please complete training first.');
        }
    };

    if (isLoading || !trainingData) {
        return (
          <div className="flex flex-col min-h-screen bg-black">
            <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
              <NavBar />
            </Suspense>
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
            <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
              <NavBar />
            </Suspense>
            <ProgressStepper currentStep={3} />
            <div>
            <section className="w-full max-w-5xl mx-auto px-4 py-16 text-white flex-grow">
                {/* Section Title */}
                <div className="mb-6">
                    <h4 className="text-xl text-gray-400 mb-2">Model Training</h4>
                    <h2 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
                    Training Progress
                    </h2>
                    <p className="text-gray-400 mb-10 mt-3 text-medium text-center sm:text-left">
                    {trainingData?.summary}
                    </p>

                    {/* Dataset Information */}
                    {datasetData && (
                      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Dataset Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Dataset</p>
                            <p className="text-white font-medium truncate">{datasetData.fileInfo.name}</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Rows</p>
                            <p className="text-white font-medium">{datasetData.fileInfo.rows.toLocaleString()}</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Columns</p>
                            <p className="text-white font-medium">{datasetData.fileInfo.columns}</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Confidence</p>
                            <p className={`font-medium ${
                              datasetData.validation.validation.confidence_score >= 80 ? 'text-green-400' :
                              datasetData.validation.validation.confidence_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {datasetData.validation.validation.confidence_score}%
                            </p>
                          </div>
                        </div>
                        
                        {/* Target Column */}
                        {datasetData.targetColumn && (
                          <div className="mb-4">
                            <p className="text-zinc-400 text-sm mb-2">Target Column</p>
                            <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm">
                              <span>{datasetData.targetColumn}</span>
                            </div>
                          </div>
                        )}

                        {/* Prompt */}
                        <div>
                          <p className="text-zinc-400 text-sm mb-2">Training Objective</p>
                          <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-800 rounded-lg p-3">
                            {datasetData.prompt}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Training Control */}
                    {datasetData && (
                      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Training Control</h3>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            trainingStatus === 'idle' ? 'bg-gray-500/20 text-gray-400' :
                            trainingStatus === 'starting' ? 'bg-yellow-500/20 text-yellow-400' :
                            trainingStatus === 'running' ? 'bg-blue-500/20 text-blue-400' :
                            trainingStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {trainingStatus === 'idle' ? 'Ready to Train' :
                             trainingStatus === 'starting' ? 'Starting...' :
                             trainingStatus === 'running' ? 'Training in Progress' :
                             trainingStatus === 'completed' ? 'Training Completed' :
                             'Training Failed'}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">
                            Target Variable: <span className="text-cyan-400 font-medium">
                              {datasetData.targetColumn || 'Not specified'}
                            </span>
                          </div>
                          
                          <Button
                            variant={trainingStatus === 'idle' ? 'primary' : 'outline'}
                            className="cursor-pointer"
                            onClick={startTraining}
                            disabled={isTraining || trainingStatus === 'running'}
                            icon={isTraining ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <PaperPlaneIcon />
                            )}
                          >
                            {isTraining ? 'Starting Training...' : 
                             trainingStatus === 'completed' ? 'Retrain Model' : 
                             'Start Training'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Training Log */}
                    <TrainingDropdownTextarea 
                      trainingData={{
                        ...trainingData,
                        trainingLogs: trainingStatus === 'idle' ? [] : trainingLogs
                      }} 
                    />
                </div>


                {trainingStatus === 'completed' && (
                    <div className="flex justify-between items-center w-full mt-6">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={handleModelReport}
                                icon={<FileText />}
                            >
                                Model Performance Report
                            </Button>
                            <Button 
                                variant="outline" 
                                className="cursor-pointer" 
                                icon={<Bot/>}
                                onClick={handleAIEnhancement}
                            >
                                Model Explainability
                            </Button>
                        </div>
                        <Button
                            variant="primary" 
                            className="cursor-pointer"
                            onClick={handleDeployModel}
                            icon={<PaperPlaneIcon />}
                        >
                            Deploy Model
                        </Button>
                    </div>
                )}

            </section>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default function ModelTraining() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-black">
        <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
          <NavBar />
        </Suspense>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
        <Footer />
      </div>
    }>
      <ModelTrainingContent />
    </Suspense>
  );
}
