'use client';

import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Upload, X, FileSpreadsheet, CheckCircle, ArrowRight } from 'lucide-react';

interface DataRow {
  [key: string]: string | number;
}

interface FileInfo {
  name: string;
  size: string;
  rows: number;
  columns: number;
}

export default function DatasetUploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [previewData, setPreviewData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processExcelFile = useCallback((file: File) => {
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
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
        console.error('Error processing Excel file:', error);
        alert('Error processing Excel file. Please ensure it\'s a valid Excel file.');
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    processExcelFile(file);
  }, [processExcelFile]);

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

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
    setPreviewData([]);
    setHeaders([]);
    setShowSuccess(false);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dataset Upload</h1>
              <p className="text-zinc-400 text-sm">Upload your dataset in Excel format for analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!uploadedFile ? (
          /* Upload Section */
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Upload Your Dataset</h2>
            <p className="text-zinc-400 mb-6">Select an Excel file (.xlsx or .xls) to preview your data</p>
            
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
                accept=".xlsx,.xls"
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
                      <p className="text-zinc-400 text-sm">Excel files (.xlsx, .xls)</p>
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

              {/* Continue Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    // Handle continue action - you can customize this
                    console.log('Continuing with dataset:', uploadedFile);
                    alert('Continuing to next step...');
                  }}
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
