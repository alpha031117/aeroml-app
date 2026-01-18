'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, ArrowRight, ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import ProgressStepper from "@/components/ProgressStepper";
import { useAuth } from '@/hooks/useAuth';

// Extend Window interface for global file storage
declare global {
  interface Window {
    aeromlRawFile?: File;
    aeromlFileKey?: string;
  }
}

interface DataRow {
  [key: string]: string | number;
}

interface FileInfo {
  name: string;
  size: string;
  rows: number;
  columns: number;
}

interface LeakyColumn {
  column_name: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ValidationResult {
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
}

// Force dynamic rendering to avoid prerender errors with useSearchParams
export const dynamic = 'force-dynamic';

function DatasetUploadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [prompt, setPrompt] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [previewData, setPreviewData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [rawFileData, setRawFileData] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get prompt from URL parameters
  useEffect(() => {
    if (searchParams) {
      const promptParam = searchParams.get('prompt');
      if (promptParam) {
        setPrompt(decodeURIComponent(promptParam));
      }
    }
  }, [searchParams]);

  // Scroll to top when validation error occurs
  useEffect(() => {
    if (validationError) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validationError]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = useCallback((file: File) => {
    setIsUploading(true);
    setRawFileData(file); // Store the raw file for API submission
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let jsonData: unknown[][] = [];
        
        if (file.type === 'text/csv' || file.type === 'application/csv' || file.name.toLowerCase().endsWith('.csv')) {
          // Process CSV file
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n').filter(line => line.trim() !== '');
          
          jsonData = lines.map(line => {
            // Simple CSV parsing - handles basic cases
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          });
        } else {
          // Process Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert to JSON
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        }
        
        if (jsonData.length > 0) {
          // Extract headers from first row
          const fileHeaders = jsonData[0].map((header: unknown, index: number) => 
            header?.toString() || `Column ${index + 1}`
          );
          
          // Convert remaining rows to objects
          const rows = jsonData.slice(1).map((row: unknown[]) => {
            const rowObj: DataRow = {};
            fileHeaders.forEach((header: string, index: number) => {
              const value = row[index];
              if (value === null || value === undefined) {
                rowObj[header] = '';
              } else if (typeof value === 'number') {
                rowObj[header] = value;
              } else {
                rowObj[header] = String(value);
              }
            });
            return rowObj;
          });

          setHeaders(fileHeaders);
          setPreviewData(rows);
          setUploadedFile({
            name: file.name,
            size: formatFileSize(file.size),
            rows: rows.length,
            columns: fileHeaders.length
          });
          setShowSuccess(true);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please ensure it\'s a valid Excel or CSV file.');
      } finally {
        setIsUploading(false);
      }
    };
    
    // Read as text for CSV, as ArrayBuffer for Excel
    if (file.type === 'text/csv' || file.type === 'application/csv' || file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv', // .csv (alternative MIME type)
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid file (.xlsx, .xls, or .csv)');
      return;
    }
    
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const validateDataset = useCallback(async () => {
    if (!rawFileData || !prompt) {
      setValidationError('Please ensure both a dataset and prompt are provided.');
      return;
    }

    if (!userId) {
      setValidationError('User authentication required. Please log in.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);
    
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', rawFileData);
      formData.append('prompt', prompt);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dataset/validate-dataset`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = `Validation failed (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
      setValidationError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error validating dataset:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error validating dataset. Please try again.';
      setValidationError(errorMessage);
      setValidationResult(null); // Clear validation result on error
    } finally {
      setIsValidating(false);
    }
  }, [rawFileData, prompt, userId]);

  const handleContinueToTraining = useCallback((forceProceed: boolean = false) => {
    if (!validationResult || !uploadedFile || !prompt) return;

    // Check eligibility - only Eligible datasets can proceed without forcing
    // Conditionally Eligible and Not Eligible require forceProceed=true
    if (!forceProceed && validationResult.validation.confidence_score < 85) {
      // Show warning for non-eligible datasets - this will be handled in the UI
      return;
    }

    // Prepare minimal data for sessionStorage (exclude large dataset)
    const minimalData = {
      prompt,
      fileInfo: uploadedFile,
      validation: validationResult,
      targetColumn: validationResult.validation.suggested_target_column
    };

    // Navigate to model-training page with data
    console.log('Navigating to training with minimal data:', minimalData);
    
    try {
      // Store minimal data in sessionStorage
      const dataKey = `aeroml-dataset-${Date.now()}`;
      sessionStorage.setItem(dataKey, JSON.stringify(minimalData));
      console.log('Stored minimal training data in sessionStorage with key:', dataKey);
      
      // Store raw file separately with a different key for the training API
      const fileKey = `aeroml-file-${Date.now()}`;
      sessionStorage.setItem(fileKey, 'placeholder'); // We'll handle file differently
      
      // Store the actual file in a way that can be accessed by the training page
      // We'll use a global variable or a different approach
      if (typeof window !== 'undefined' && rawFileData) {
        window.aeromlRawFile = rawFileData || undefined;
        window.aeromlFileKey = fileKey;
      }
      
      // Navigate with just the key
      router.push(`/model-training?dataKey=${dataKey}&fileKey=${fileKey}`);
    } catch (error) {
      console.error('Error preparing training data:', error);
      alert('Error preparing data for training. Please try again.');
    }
  }, [validationResult, uploadedFile, prompt, rawFileData, router]);

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
    setPreviewData([]);
    setHeaders([]);
    setShowSuccess(false);
    setValidationResult(null);
    setRawFileData(null);
    setValidationError(null);
  }, []);

  // Helper function to determine eligibility type based on confidence score
  const getEligibilityType = useCallback((confidenceScore: number): {
    type: 'eligible' | 'conditionally-eligible' | 'not-eligible';
    label: string;
    icon: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
  } => {
    if (confidenceScore >= 85) {
      return {
        type: 'eligible',
        label: 'Eligible',
        icon: '✅',
        description: 'Dataset fully meets requirements and can be used directly',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20'
      };
    } else if (confidenceScore >= 60) {
      return {
        type: 'conditionally-eligible',
        label: 'Conditionally Eligible',
        icon: '⚠️',
        description: 'Dataset is usable but requires cleaning, transformation, or manual review',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20'
      };
    } else {
      return {
        type: 'not-eligible',
        label: 'Not Eligible',
        icon: '❌',
        description: 'Dataset fails key requirements and should not be used',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20'
      };
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Nav Bar */}
      <Suspense fallback={<div className="h-16 bg-black/80 backdrop-blur-md border-b border-white/10" />}>
        <NavBar />
      </Suspense>
      
      <ProgressStepper currentStep={2} />

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-8 text-white">
          {/* Section Title */}
          <div className="mb-6">
            <h4 className="text-xl text-gray-400 mb-2">Dataset Upload</h4>
            <h2 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
              Upload your dataset in Excel or CSV format for analysis
            </h2>
          </div>
        {/* Model Prompt Context */}
        {prompt && (
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Model Prompt</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{prompt}</p>
              </div>
            </div>
          </div>
        )}

        {!uploadedFile ? (
          /* Upload Section */
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Upload Your Dataset</h2>
            <p className="text-zinc-400 mb-6">Select an Excel (.xlsx, .xls) or CSV file to preview your data</p>
            
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-400/5'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-cyan-500/10 rounded-full">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                    <p className="text-white font-medium">Processing file...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-zinc-400 text-sm">Excel (.xlsx, .xls) or CSV files</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Preview Section */
          <div className="space-y-6">
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-green-400 font-medium">Success</p>
                  <p className="text-green-300/80 text-sm">Dataset uploaded successfully with {uploadedFile.rows} rows</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowSuccess(false)}
                  className="text-green-400 hover:text-green-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Validation Error Message */}
            {validationError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-400 font-medium mb-1">Validation Error</p>
                  <p className="text-red-300/80 text-sm">{validationError}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setValidationError(null)}
                  className="text-red-400 hover:text-red-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Dataset Info */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Dataset Preview</h2>
                <Button
                  variant="ghost"
                  onClick={clearUpload}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-900 rounded-lg p-3">
                  <p className="text-zinc-400 text-sm">Filename</p>
                  <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-3">
                  <p className="text-zinc-400 text-sm">File Size</p>
                  <p className="text-white font-medium">{uploadedFile.size}</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-3">
                  <p className="text-zinc-400 text-sm">Rows</p>
                  <p className="text-white font-medium">{uploadedFile.rows.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900 rounded-lg p-3">
                  <p className="text-zinc-400 text-sm">Columns</p>
                  <p className="text-white font-medium">{uploadedFile.columns}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider border-r border-zinc-800">
                          NO
                        </th>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider border-r border-zinc-800 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-zinc-950 divide-y divide-zinc-800">
                      {previewData.slice(0, 100).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-zinc-900/50">
                          <td className="px-4 py-3 text-sm text-zinc-300 border-r border-zinc-800">
                            {rowIndex + 1}
                          </td>
                          {headers.map((header, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-zinc-300 border-r border-zinc-800 last:border-r-0"
                            >
                              {row[header]?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {previewData.length > 100 && (
                  <div className="bg-zinc-900 px-4 py-3 text-center">
                    <p className="text-zinc-400 text-sm">
                      Showing first 100 rows of {previewData.length.toLocaleString()} total rows
                    </p>
                  </div>
                )}
              </div>

              {/* Validation Results */}
              {validationResult && (() => {
                const eligibility = getEligibilityType(validationResult.validation.confidence_score);
                return (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Dataset Validation Results</h3>
                    
                    {/* Eligibility Status */}
                    <div className={`${eligibility.bgColor} ${eligibility.borderColor} border rounded-xl p-6`}>
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{eligibility.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-xl font-bold ${eligibility.color}`}>
                              {eligibility.label}
                            </h4>
                          </div>
                          <p className="text-zinc-300 text-sm leading-relaxed">
                            {eligibility.description}
                          </p>
                        </div>
                      </div>
                    </div>

                  {/* Validation Message */}
                  <div className="bg-zinc-900 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Validation Summary</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {validationResult.validation.validation_message}
                    </p>
                  </div>

                  {/* Suggested Target Column */}
                  {validationResult.validation.suggested_target_column && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Suggested Target Column</h4>
                      <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm">
                        <span>{validationResult.validation.suggested_target_column}</span>
                      </div>
                    </div>
                  )}

                  {/* Potential Issues */}
                  {validationResult.validation.potential_issues.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Potential Issues</h4>
                      <ul className="space-y-1">
                        {validationResult.validation.potential_issues.map((issue, index) => (
                          <li key={index} className="text-red-400 text-sm flex items-start gap-2">
                            <span className="text-red-400 flex-shrink-0">•</span>
                            <span className="flex-1">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Preprocessing */}
                  {validationResult.validation.suggested_preprocessing.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Suggested Preprocessing Steps</h4>
                      <ul className="space-y-1">
                        {validationResult.validation.suggested_preprocessing.map((step, index) => (
                          <li key={index} className="text-zinc-300 text-sm flex items-start gap-2">
                            <span className="text-cyan-400 flex-shrink-0">•</span>
                            <span className="flex-1">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Excluded Columns (Leaky Columns) */}
                  {validationResult.validation.leaky_columns && validationResult.validation.leaky_columns.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Excluded Columns (Data Leakage Detected)</h4>
                      <div className="space-y-3">
                        {validationResult.validation.leaky_columns.map((leakyColumn, index) => (
                          <div key={index} className="bg-zinc-950 rounded-lg p-3 border border-red-500/20">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-red-400 font-medium">{leakyColumn.column_name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  leakyColumn.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                  leakyColumn.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {leakyColumn.severity.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <p className="text-zinc-300 text-sm mb-2">{leakyColumn.reason}</p>
                            <div className="flex items-start gap-2 mt-2">
                              <span className="text-cyan-400 text-xs font-medium">Recommendation:</span>
                              <span className="text-zinc-400 text-xs">{leakyColumn.recommendation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Columns to Exclude (Simple List) */}
                  {validationResult.validation.columns_to_exclude && validationResult.validation.columns_to_exclude.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Columns to Exclude</h4>
                      <div className="flex flex-wrap gap-2">
                        {validationResult.validation.columns_to_exclude.map((column, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/20">
                            <X className="w-3 h-3" />
                            {column}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safe Columns */}
                  {validationResult.validation.safe_columns && validationResult.validation.safe_columns.length > 0 && (
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Safe Columns</h4>
                      <div className="flex flex-wrap gap-2">
                        {validationResult.validation.safe_columns.map((column, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/20">
                            <CheckCircle className="w-3 h-3" />
                            {column}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6">
                {!validationResult ? (
                  <div className="flex justify-end w-full">
                    <button
                      onClick={validateDataset}
                      disabled={isValidating || !prompt}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
                    >
                      {isValidating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          Validate Dataset
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setValidationResult(null);
                        setValidationError(null);
                      }}
                      className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Re-validate
                    </button>
                    
                    {(() => {
                      const eligibility = getEligibilityType(validationResult.validation.confidence_score);
                      if (eligibility.type === 'eligible') {
                        return (
                          <button
                            onClick={() => handleContinueToTraining(false)}
                            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Continue to Training
                          </button>
                        );
                      } else if (eligibility.type === 'conditionally-eligible') {
                        return (
                          <div className="flex gap-2">
                            <button
                              onClick={clearUpload}
                              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              Upload New Dataset
                            </button>
                            <button
                              onClick={() => handleContinueToTraining(true)}
                              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              Proceed Anyway
                            </button>
                          </div>
                        );
                      } else {
                        // Not Eligible - only allow uploading new dataset
                        return (
                          <button
                            onClick={clearUpload}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" />
                            Upload New Dataset
                          </button>
                        );
                      }
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function DatasetUploadPage() {
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
      <DatasetUploadPageContent />
    </Suspense>
  );
}
