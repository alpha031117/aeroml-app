'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildApiUrl } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';

// Type definitions for the API response
interface KeyMetrics {
  model_name: string;
  model_category: string;
  algorithm: string;
  MSE: number;
  RMSE: number;
  R2: number;
  AUC: number;
  PR_AUC: number;
  LogLoss: number;
  Gini: number;
  AIC: number;
  mean_per_class_error: number;
  nobs: number;
}

interface ConfusionMatrix {
  table: string;
}

interface FullPerformanceDetails {
  model_category: string;
  MSE: number;
  RMSE: number;
  nobs: number;
  r2: number;
  logloss: number;
  AIC: number;
  AUC: number;
  pr_auc: number;
  Gini: number;
  mean_per_class_error: number;
  cm: ConfusionMatrix;
  thresholds_and_metric_scores: string;
  max_criteria_and_metric_scores: string;
  gains_lift_table: string;
  residual_deviance: number;
  null_deviance: number;
  null_degrees_of_freedom: number;
  residual_degrees_of_freedom: number;
}

interface ModelPerformanceResponse {
  session_id: string;
  status: string;
  key_metrics: KeyMetrics;
  full_performance_details: FullPerformanceDetails;
  created_at: string;
  target_variable: string;
  data_path: string;
}

export default function ModelDetail() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || 'default';
  
  const [data, setData] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe number formatting helpers
  const formatNumber = (value: number | undefined | null, decimals: number = 4): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number | undefined | null, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return (value * 100).toFixed(decimals) + '%';
  };

  const formatInteger = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return value.toLocaleString();
  };

  useEffect(() => {
    const fetchModelPerformance = async () => {
      if (sessionId === 'default') return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/model-training/model-performance/${sessionId}`));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ModelPerformanceResponse = await response.json();
        
        if (result.status === 'success') {
          setData(result);
        } else {
          throw new Error('Failed to fetch model performance data');
        }
      } catch (error) {
        console.error('Error fetching model performance:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch model performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchModelPerformance();
  }, [sessionId]);

  // Parse confusion matrix table
  const parseConfusionMatrix = (tableString: string) => {
    if (!tableString) return [];
    
    const lines = tableString.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(2); // Skip header lines
    
    const matrixData = dataLines.map(line => {
      const parts = line.split(/\s+/).filter(part => part.trim());
      return {
        actual: parts[0] || 'N/A',
        predicted_no: parts[1] || 'N/A',
        predicted_yes: parts[2] || 'N/A',
        error: parts[3] || 'N/A',
        rate: parts[4] ? parts[4] + (parts[5] ? ' ' + parts[5] : '') : 'N/A'
      };
    });
    
    return matrixData;
  };

  // Parse maximum metrics table
  const parseMaxMetrics = (tableString: string) => {
    if (!tableString) return [];
    
    const lines = tableString.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(2); // Skip header lines
    
    return dataLines.map(line => {
      const parts = line.split(/\s+/).filter(part => part.trim());
      const threshold = parseFloat(parts[parts.length - 3]);
      const value = parseFloat(parts[parts.length - 2]);
      const idx = parseInt(parts[parts.length - 1]);
      
      return {
        metric: parts[0] + (parts[1] ? ' ' + parts[1] : ''),
        threshold: isNaN(threshold) ? 0 : threshold,
        value: isNaN(value) ? 0 : value,
        idx: isNaN(idx) ? 0 : idx
      };
    });
  };

  // Parse gains/lift table
  const parseGainsLiftTable = (tableString: string) => {
    if (!tableString) return [];
    
    const lines = tableString.split('\n').filter(line => line.trim());
    const dataLines = lines.slice(2, 12); // Take first 10 groups
    
    return dataLines.map(line => {
      const parts = line.split(/\s+/).filter(part => part.trim());
      const cumulative_data_fraction = parseFloat(parts[1]);
      const lift = parseFloat(parts[3]);
      const cumulative_lift = parseFloat(parts[4]);
      const response_rate = parseFloat(parts[5]);
      const capture_rate = parseFloat(parts[8]);
      const cumulative_capture_rate = parseFloat(parts[9]);
      const gain = parseFloat(parts[10]);
      const cumulative_gain = parseFloat(parts[11]);
      
      return {
        group: parts[0] || 'N/A',
        cumulative_data_fraction: isNaN(cumulative_data_fraction) ? 0 : cumulative_data_fraction,
        lift: isNaN(lift) ? 0 : lift,
        cumulative_lift: isNaN(cumulative_lift) ? 0 : cumulative_lift,
        response_rate: isNaN(response_rate) ? 0 : response_rate,
        capture_rate: isNaN(capture_rate) ? 0 : capture_rate,
        cumulative_capture_rate: isNaN(cumulative_capture_rate) ? 0 : cumulative_capture_rate,
        gain: isNaN(gain) ? 0 : gain,
        cumulative_gain: isNaN(cumulative_gain) ? 0 : cumulative_gain
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading model performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">No data available</div>
      </div>
    );
  }

  const confusionMatrixData = parseConfusionMatrix(data.full_performance_details?.cm?.table || '');
  const maxMetricsData = parseMaxMetrics(data.full_performance_details?.max_criteria_and_metric_scores || '');
  const gainsLiftData = parseGainsLiftTable(data.full_performance_details?.gains_lift_table || '');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Top Model Performance Details</h1>
              <p className="text-zinc-400">Comprehensive performance metrics and model evaluation</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-zinc-400">Model ID</div>
                <div className="text-white font-mono text-sm">{data.key_metrics?.model_name || 'N/A'}</div>
              </div>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30">
                Best in
              </div>
            </div>
          </div>
          
          {/* Model Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-zinc-400">Model ID</div>
              <div className="text-white font-mono text-sm truncate">{data.key_metrics?.model_name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Category</div>
              <div className="text-white">{data.key_metrics?.model_category || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Observations</div>
              <div className="text-white">{formatInteger(data.key_metrics?.nobs)}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Target Variable</div>
              <div className="text-white">{data.target_variable || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="MSE"
            value={formatNumber(data.key_metrics?.MSE)}
            pill="Mean Squared Error"
            pillColor="bg-blue-500/20 text-blue-400 border border-blue-500/30"
          />
          <StatCard
            label="RMSE"
            value={formatNumber(data.key_metrics?.RMSE)}
            pill="Root Mean Squared Error"
            pillColor="bg-purple-500/20 text-purple-400 border border-purple-500/30"
          />
          <StatCard
            label="R²"
            value={formatNumber(data.key_metrics?.R2)}
            pill="Coefficient of Determination"
            pillColor="bg-green-500/20 text-green-400 border border-green-500/30"
          />
          <StatCard
            label="AUC"
            value={formatNumber(data.key_metrics?.AUC)}
            pill="Area Under Curve"
            pillColor="bg-orange-500/20 text-orange-400 border border-orange-500/30"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">PR AUC</span>
                <span className="text-white font-mono">{formatNumber(data.key_metrics?.PR_AUC)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Log Loss</span>
                <span className="text-white font-mono">{formatNumber(data.key_metrics?.LogLoss)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Gini</span>
                <span className="text-white font-mono">{formatNumber(data.key_metrics?.Gini)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">AIC</span>
                <span className="text-white font-mono">{formatNumber(data.key_metrics?.AIC, 2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Statistical Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Mean Per Class Error</span>
                <span className="text-white font-mono">{formatPercentage(data.key_metrics?.mean_per_class_error)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Residual DF</span>
                <span className="text-white font-mono">{formatInteger(data.full_performance_details?.residual_degrees_of_freedom)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Null DF</span>
                <span className="text-white font-mono">{formatInteger(data.full_performance_details?.null_degrees_of_freedom)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Null Deviance</span>
                <span className="text-white font-mono">{formatNumber(data.full_performance_details?.null_deviance, 2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Confusion Matrix</h3>
          <p className="text-zinc-400 text-sm mb-4">Classification performance breakdown by actual vs predicted classes</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400">Actual Class</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Predicted No</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Predicted Yes</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Error Rate</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Count</th>
                </tr>
              </thead>
              <tbody>
                {confusionMatrixData.map((row, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-3 px-4 text-white font-medium">{row.actual}</td>
                    <td className="py-3 px-4 text-white font-mono">{row.predicted_no}</td>
                    <td className="py-3 px-4 text-white font-mono">{row.predicted_yes}</td>
                    <td className="py-3 px-4 text-white font-mono">{row.error}</td>
                    <td className="py-3 px-4 text-zinc-400 text-xs">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maximum Metrics at Optimal Thresholds */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Maximum Metrics at Optimal Thresholds</h3>
          <p className="text-zinc-400 text-sm mb-4">Peak performance metrics achieved at their respective optimal threshold values</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400">Metric</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Threshold</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Value</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Index</th>
                </tr>
              </thead>
              <tbody>
                {maxMetricsData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-3 px-4 text-white">{row.metric}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatNumber(row.threshold, 6)}</td>
                    <td className="py-3 px-4 text-white font-mono">
                      {row.value < 1 ? formatNumber(row.value, 6) : formatInteger(row.value)}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{row.idx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gains/Lift Analysis */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Gains/Lift Analysis</h3>
          <p className="text-zinc-400 text-sm mb-4">Model performance across different population segments (Avg response rate: 26.54%)</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400">Group</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Cumulative Data %</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Lift</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Cumulative Lift</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Response Rate</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Capture Rate</th>
                  <th className="text-left py-3 px-4 text-zinc-400">Cumulative Gain</th>
                </tr>
              </thead>
              <tbody>
                {gainsLiftData.map((row, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-3 px-4 text-white font-medium">{row.group}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatPercentage(row.cumulative_data_fraction)}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatNumber(row.lift, 2)}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatNumber(row.cumulative_lift, 2)}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatPercentage(row.response_rate, 1)}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatPercentage(row.capture_rate, 1)}</td>
                    <td className="py-3 px-4 text-white font-mono">{formatNumber(row.cumulative_gain, 1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
