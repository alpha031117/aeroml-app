'use client';

import { useEffect, useState } from 'react';
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navbar/navbar";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSearchParams } from 'next/navigation';
import TrainingDropdownTextarea from '@/components/training_textarea/TrainingDropdownTextarea';
import Loader from '@/components/loader/loader';
import { Button } from '@/components/ui';
import { Bot, FileText } from 'lucide-react';

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

// Define the dataset data interface from previous page
interface DatasetData {
  prompt: string;
  dataset: {
    fileInfo: {
      name: string;
      size: string;
      rows: number;
      columns: number;
    };
    headers: string[];
    data: Array<Record<string, string | number>>;
    rawFile?: File;
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
    };
  };
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
  datasetInfo?: DatasetData; // Add dataset info to training data
}

export default function ModelTraining() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
    const [datasetData, setDatasetData] = useState<DatasetData | null>(null);
    


    // Dummy training data
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

    useEffect(() => {
        // Check for dataset data from dataset-upload page
        const dataKeyParam = searchParams ? searchParams.get('dataKey') : null;
        const datasetDataParam = searchParams ? searchParams.get('datasetData') : null;
        const sourcesDataParam = searchParams ? searchParams.get('sourcesData') : null;
        
        if (dataKeyParam) {
          // New method: Read from sessionStorage
          try {
            const storedData = sessionStorage.getItem(dataKeyParam);
            if (storedData) {
              const parsedDataset: DatasetData = JSON.parse(storedData);
              setDatasetData(parsedDataset);
              
              // Create training data based on real dataset
              const realTrainingData: TrainingData = {
                summary: `Training a machine learning model on ${parsedDataset.dataset.fileInfo.name} with ${parsedDataset.dataset.fileInfo.rows.toLocaleString()} samples for: ${parsedDataset.prompt}`,
                modelName: `AeroML-${parsedDataset.dataset.fileInfo.name.split('.')[0]}`,
                datasetSize: parsedDataset.dataset.fileInfo.rows,
                currentEpoch: 1,
                totalEpochs: Math.min(50, Math.max(10, Math.floor(parsedDataset.dataset.fileInfo.rows / 1000))), // Dynamic epochs based on dataset size
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
                    message: `Starting training with ${parsedDataset.dataset.fileInfo.name}...`
                  }
                ],
                datasetInfo: parsedDataset
              };
              
              setTrainingData(realTrainingData);
              
              // Clean up sessionStorage after use
              sessionStorage.removeItem(dataKeyParam);
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
            const parsedDataset: DatasetData = JSON.parse(decodeURIComponent(datasetDataParam));
            setDatasetData(parsedDataset);
            
            // Create training data based on real dataset
            const realTrainingData: TrainingData = {
              summary: `Training a machine learning model on ${parsedDataset.dataset.fileInfo.name} with ${parsedDataset.dataset.fileInfo.rows.toLocaleString()} samples for: ${parsedDataset.prompt}`,
              modelName: `AeroML-${parsedDataset.dataset.fileInfo.name.split('.')[0]}`,
              datasetSize: parsedDataset.dataset.fileInfo.rows,
              currentEpoch: 1,
              totalEpochs: Math.min(50, Math.max(10, Math.floor(parsedDataset.dataset.fileInfo.rows / 1000))), // Dynamic epochs based on dataset size
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
                  message: `Starting training with ${parsedDataset.dataset.fileInfo.name}...`
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
            const parsed = JSON.parse(decodeURIComponent(sourcesDataParam));
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
      }, [searchParams]);

    const handleContinue = () => {
        // TODO: Implement continue logic when API is ready
        console.log("Continue button clicked - API integration pending");
    };

      if (isLoading || !trainingData) {
        return (
          <div className="flex flex-col min-h-screen bg-black">
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" className="cursor-pointer" icon={<Bot/>}>
                            Ask AERO AI for Model Enhancement
                        </Button>
                    </div>
                </div>
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
                            <p className="text-white font-medium truncate">{datasetData.dataset.fileInfo.name}</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Rows</p>
                            <p className="text-white font-medium">{datasetData.dataset.fileInfo.rows.toLocaleString()}</p>
                          </div>
                          <div className="bg-zinc-800 rounded-lg p-3">
                            <p className="text-zinc-400 text-sm">Columns</p>
                            <p className="text-white font-medium">{datasetData.dataset.fileInfo.columns}</p>
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
                        {datasetData.validation.validation.suggested_target_column && (
                          <div className="mb-4">
                            <p className="text-zinc-400 text-sm mb-2">Target Column</p>
                            <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm">
                              <span>{datasetData.validation.validation.suggested_target_column}</span>
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

                    {/* Training Log */}
                    <TrainingDropdownTextarea trainingData={trainingData} />
                </div>
                <div className="flex justify-between items-center w-full mt-6">
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        // onClick={handleBack}
                        icon={<FileText />}
                    >
                        Model Performance Report
                    </Button>
                    <Button
                        variant="primary" 
                        className="cursor-pointer"
                        onClick={handleContinue}
                        icon={<PaperPlaneIcon />}
                    >
                        Deploy Model
                    </Button>
                </div>
            </section>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
