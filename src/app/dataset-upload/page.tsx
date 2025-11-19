'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Upload, X, FileSpreadsheet, CheckCircle, ArrowRight, MessageSquare } from 'lucide-react';
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

interface DataRow {
  [key: string]: string | number;
}

interface FileInfo {
  name: string;
  size: string;
  rows: number;
  columns: number;
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
  };
}

export default function DatasetUploadPage() {
  const searchParams = useSearchParams();
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

  // Get prompt from URL parameters
  useEffect(() => {
    if (searchParams) {
      const promptParam = searchParams.get('prompt');
      if (promptParam) {
        setPrompt(decodeURIComponent(promptParam));
      }
    }
  }, [searchParams]);

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
        let jsonData: any[][] = [];
        
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
          jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        }
        
        if (jsonData.length > 0) {
          // Extract headers from first row
          const fileHeaders = jsonData[0].map((header: any, index: number) => 
            header?.toString() || `Column ${index + 1}`
          );
          
          // Convert remaining rows to objects
          const rows = jsonData.slice(1).map((row: any[]) => {
            const rowObj: DataRow = {};
            fileHeaders.forEach((header: string, index: number) => {
              rowObj[header] = row[index] !== undefined ? row[index] : '';
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
      alert('Please ensure both a dataset and prompt are provided.');
      return;
    }

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', rawFileData);
      formData.append('prompt', prompt);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dataset/validate-dataset`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ValidationResult = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating dataset:', error);
      alert('Error validating dataset. Please try again.');
    } finally {
      setIsValidating(false);
    }
  }, [rawFileData, prompt]);

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
    setPreviewData([]);
    setHeaders([]);
    setShowSuccess(false);
    setValidationResult(null);
    setRawFileData(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Nav Bar */}
      <NavBar />
      
      <div className="flex-grow">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
              <h1 className="text-2xl font-bold text-white">Dataset Upload</h1>
              <p className="text-zinc-400 text-sm">Upload your dataset in Excel or CSV format for analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 text-white">
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
              {validationResult && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Dataset Validation Results</h3>
                  
                  {/* Confidence Score */}
                  <div className="bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-zinc-400 text-sm">Confidence Score</span>
                      <span className={`text-lg font-bold ${
                        validationResult.validation.confidence_score >= 80 ? 'text-green-400' :
                        validationResult.validation.confidence_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {validationResult.validation.confidence_score}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          validationResult.validation.confidence_score >= 80 ? 'bg-green-400' :
                          validationResult.validation.confidence_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${validationResult.validation.confidence_score}%` }}
                      ></div>
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
                            <span className="text-red-400 mt-1">•</span>
                            <span>{issue}</span>
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
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6">
                {!validationResult ? (
                  <div className="flex justify-end w-full">
                    <button
                      onClick={validateDataset}
                      disabled={isValidating || !prompt}
                      className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 cursor-pointer"
                    >
                      {isValidating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                      onClick={() => setValidationResult(null)}
                      className="inline-flex items-center gap-2 bg-zinc-600 hover:bg-zinc-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-500 cursor-pointer"
                    >
                      Re-validate
                    </button>
                    <button
                      onClick={() => {
                        // Handle continue action - pass both prompt and dataset data
                        console.log('Continuing with:', { prompt, dataset: uploadedFile, data: previewData, validation: validationResult });
                        
                        // You can navigate to the next page with both prompt and dataset data
                        // Example: router.push(`/model-training?prompt=${encodeURIComponent(prompt)}&dataset=${encodeURIComponent(JSON.stringify({ fileInfo: uploadedFile, headers, data: previewData }))}`);
                        
                        alert(`Continuing to next step with validated dataset:\n- Prompt: ${prompt}\n- Dataset: ${uploadedFile.name} (${uploadedFile.rows} rows)\n- Confidence: ${validationResult.validation.confidence_score}%`);
                      }}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
