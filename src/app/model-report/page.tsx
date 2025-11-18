"use client";
import React, { useState, useMemo, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon, EyeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import NavBar from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api";

// Type definition for model data
interface ModelData {
  model_id: string;
  logloss: number;
  auc: number;
  aucpr: number;
  mean_per_class_error: number;
  rmse: number;
  mse: number;
}

// Type definition for API response
interface LeaderboardResponse {
  session_id: string;
  status: string;
  leaderboard: ModelData[];
  created_at: string;
  data_path: string;
  target_variable: string;
  max_runtime_secs: number;
  model_path: string;
}

type SortKey = keyof ModelData;
type SortDirection = 'asc' | 'desc';

export default function ModelReport() {
  const [sortKey, setSortKey] = useState<SortKey>('auc');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [modelData, setModelData] = useState<ModelData[]>([]);
  const [sessionInfo, setSessionInfo] = useState<Omit<LeaderboardResponse, 'leaderboard'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('default');

  // Extract session_id from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const extractedSessionId = urlParams.get('session_id') || 'default';
      setSessionId(extractedSessionId);
    }
  }, []);

  // Fetch model data from API
  useEffect(() => {
    const fetchModelData = async () => {
      if (sessionId === 'default') return; // Don't fetch if sessionId hasn't been extracted yet
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/model-training/h2o-leaderboard/${sessionId}`));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LeaderboardResponse = await response.json();
        
        // Check if the response has the expected structure
        if (data.status === 'success' && data.leaderboard) {
          setModelData(data.leaderboard);
          setSessionInfo({
            session_id: data.session_id,
            status: data.status,
            created_at: data.created_at,
            data_path: data.data_path,
            target_variable: data.target_variable,
            max_runtime_secs: data.max_runtime_secs,
            model_path: data.model_path
          });
        } else {
          throw new Error('Invalid response format or unsuccessful status');
        }
      } catch (error) {
        console.error('Error fetching model data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch model data');
      } finally {
        setLoading(false);
      }
    };

    fetchModelData();
  }, [sessionId]);

  // Sort the data based on current sort key and direction
  const sortedData = useMemo(() => {
    return [...modelData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [sortKey, sortDirection]);

  // Handle column header click for sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Calculate summary statistics
  const totalModels = modelData.length;
  const bestAUC = modelData.length > 0 ? Math.max(...modelData.map(m => m.auc)) : 0;
  const lowestLogLoss = modelData.length > 0 ? Math.min(...modelData.map(m => m.logloss)) : 0;
  const bestAUCPR = modelData.length > 0 ? Math.max(...modelData.map(m => m.aucpr)) : 0;

  // Format numbers to 4 decimal places
  const formatNumber = (num: number) => num.toFixed(4);

  // Render sort icon
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="h-4 w-4" />
      : <ChevronDownIcon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
            <div className="h-6 w-6 rounded bg-cyan-400"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Model Performance Report</h1>
            <p className="text-sm text-neutral-400">
              {sessionInfo 
                ? `AutoML training results for ${sessionInfo.target_variable} prediction on ${sessionInfo.data_path}`
                : 'Comprehensive leaderboard of all trained models with performance metrics'
              }
            </p>
          </div>
        </div>

        {/* Session Information */}
        {sessionInfo && (
          <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Session Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Session ID:</span>
                <div className="font-mono text-neutral-200 mt-1 break-all">{sessionInfo.session_id}</div>
              </div>
              <div>
                <span className="text-neutral-400">Target Variable:</span>
                <div className="text-neutral-200 mt-1">{sessionInfo.target_variable}</div>
              </div>
              <div>
                <span className="text-neutral-400">Dataset:</span>
                <div className="text-neutral-200 mt-1">{sessionInfo.data_path}</div>
              </div>
              <div>
                <span className="text-neutral-400">Training Time:</span>
                <div className="text-neutral-200 mt-1">{sessionInfo.max_runtime_secs}s</div>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <span className="text-neutral-400">Created:</span>
                <div className="text-neutral-200 mt-1">{new Date(sessionInfo.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Model Leaderboard Section */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-neutral-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading model performance data...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-red-400">
                <ExclamationTriangleIcon className="h-6 w-6" />
                <div>
                  <div className="font-medium">Failed to load model data</div>
                  <div className="text-sm text-neutral-400 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && modelData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-neutral-400">
                <div className="font-medium">No model data available</div>
                <div className="text-sm mt-1">Train some models first to see the leaderboard</div>
              </div>
            </div>
          )}

          {/* Content - show when not loading and has data */}
          {!loading && modelData.length > 0 && (
            <>
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 p-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Model Leaderboard</h2>
              <p className="text-sm text-neutral-400">Top performing models ranked by AUC. Click column headers to sort by different metrics.</p>
            </div>
            <a
              href={`/model-detail?session_id=${sessionId}`}
              className="inline-flex items-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-md px-4 py-2 font-medium text-sm transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Top Model Details
            </a>  
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full min-w-full table-auto">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    #
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('model_id')}
                  >
                    <div className="flex items-center gap-1">
                      Model ID
                      {renderSortIcon('model_id')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('auc')}
                  >
                    <div className="flex items-center gap-1">
                      AUC
                      {renderSortIcon('auc')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('logloss')}
                  >
                    <div className="flex items-center gap-1">
                      LogLoss
                      {renderSortIcon('logloss')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('aucpr')}
                  >
                    <div className="flex items-center gap-1">
                      AUCPR
                      {renderSortIcon('aucpr')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('mean_per_class_error')}
                  >
                    <div className="flex items-center gap-1">
                      Error
                      {renderSortIcon('mean_per_class_error')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('rmse')}
                  >
                    <div className="flex items-center gap-1">
                      RMSE
                      {renderSortIcon('rmse')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => handleSort('mse')}
                  >
                    <div className="flex items-center gap-1">
                      MSE
                      {renderSortIcon('mse')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 bg-neutral-900/20">
                {sortedData.map((model, index) => (
                  <tr key={model.model_id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded text-xs font-medium ${
                        index === 0 ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200 font-mono max-w-xs">
                      <div className="truncate" title={model.model_id}>
                        {model.model_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-400">
                      {formatNumber(model.auc)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {formatNumber(model.logloss)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {formatNumber(model.aucpr)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {formatNumber(model.mean_per_class_error)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {formatNumber(model.rmse)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {formatNumber(model.mse)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="border-t border-neutral-800 bg-neutral-950/30 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-neutral-400">Total Models: </span>
                  <span className="font-semibold text-white">{totalModels}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Best AUC: </span>
                  <span className="font-semibold text-green-400">{formatNumber(bestAUC)}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Lowest LogLoss: </span>
                  <span className="font-semibold text-blue-400">{formatNumber(lowestLogLoss)}</span>
                </div>
                <div>
                  <span className="text-neutral-400">Best AUCPR: </span>
                  <span className="font-semibold text-cyan-400">{formatNumber(bestAUCPR)}</span>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
