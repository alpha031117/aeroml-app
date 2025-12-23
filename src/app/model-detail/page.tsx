'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/hooks/useAuth';
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Button } from '@/components/ui';
import { Bot } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

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
  const router = useRouter();
  const sessionId = searchParams?.get('session_id') || 'default';
  const { userId, isLoading: authLoading } = useAuth();
  
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
      if (authLoading) return;
      
      if (!userId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/model-training/model-performance/${sessionId}?user_id=${userId}`));
        
        if (response.status === 404) {
          setError('MODEL_NOT_FOUND');
          return;
        }

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
  }, [sessionId, userId, authLoading]);

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

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-zinc-400">Loading model performance data...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userId) {
     return (
       <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
         <NavBar />
         <div className="flex-grow flex items-center justify-center">
           <div className="text-zinc-400">Please log in to view model performance</div>
         </div>
         <Footer />
       </div>
     );
  }

  if (error === 'MODEL_NOT_FOUND') {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <NavBar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Model Data Not Found</h1>
          <p className="text-zinc-400 text-center max-w-md mb-8">
            We couldn't find performance metrics for this session. This typically means the training process failed or didn't complete successfully.
          </p>
          <div className="flex gap-4">
              <Link href="/model-history" className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors">
                  Back to History
              </Link>
              <Link href="/dataset-upload" className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
                  Train New Model
              </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-zinc-400">No data available</div>
        </div>
        <Footer />
      </div>
    );
  }

  const confusionMatrixData = parseConfusionMatrix(data.full_performance_details?.cm?.table || '');
  const maxMetricsData = parseMaxMetrics(data.full_performance_details?.max_criteria_and_metric_scores || '');
  const gainsLiftData = parseGainsLiftTable(data.full_performance_details?.gains_lift_table || '');

  const handleMlEnhancement = () => {
    if (sessionId && sessionId !== 'default') {
      router.push(`/model-enhancement?session_id=${sessionId}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <NavBar />
      
      <div className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Section Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-xl text-gray-400 mb-2">Model Performance</h4>
            <h2 className="text-xl sm:text-2xl font-medium text-center sm:text-left">
              Top Model Performance Details
            </h2>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer hover:bg-zinc-800 border-zinc-700 whitespace-nowrap shrink-0"
            onClick={handleMlEnhancement}
            icon={<Bot/>}
          >
            Model Explainability
          </Button>
        </div>

        {/* Model Info */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Model Information</h3>
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30">
              Best in
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <h3 className="text-lg font-semibold text-white mb-2">Gains/Lift Analysis</h3>
          <p className="text-zinc-400 text-sm mb-6">Model performance evaluation across population segments</p>
          
          {/* Filter out baseline row and prepare chart data */}
          {(() => {
            const chartData = gainsLiftData
              .filter(row => row.group !== '---' && row.group !== 'N/A')
              .map(row => ({
                group: parseInt(row.group) || 0,
                cumulativeDataPercent: row.cumulative_data_fraction * 100,
                lift: row.lift,
                cumulativeLift: row.cumulative_lift,
                responseRate: row.response_rate * 100,
                captureRate: row.capture_rate * 100,
                cumulativeGain: row.cumulative_gain,
                // Random baseline: diagonal line (y = x for cumulative gain)
                randomBaseline: row.cumulative_data_fraction * 100
              }))
              .sort((a, b) => a.group - b.group);

            // Calculate optimal cut-off points
            const optimalCutoff = chartData.find(d => d.cumulativeGain >= 80) || chartData[chartData.length - 1];
            const top10Percent = chartData.find(d => d.cumulativeDataPercent >= 10);
            const top20Percent = chartData.find(d => d.cumulativeDataPercent >= 20);

            // Custom tooltip style for dark theme
            const CustomTooltip = ({ active, payload, label }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-medium mb-2">
                      {typeof label === 'number' ? `Population: ${label.toFixed(1)}%` : `Group: ${label}`}
                    </p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value?.toFixed(2)}${entry.dataKey?.includes('Percent') || entry.dataKey?.includes('Rate') ? '%' : entry.dataKey?.includes('Gain') ? '%' : ''}`}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            };

            return (
              <div className="space-y-8">
                {/* Cumulative Gains Curve with Random Baseline */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-white mb-1">Cumulative Gains Curve</h4>
                      <p className="text-xs text-zinc-500">
                        Shows the percentage of positive responses captured by targeting top X% of population
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                      <defs>
                        <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="cumulativeDataPercent" 
                        stroke="#a1a1aa"
                        label={{ value: 'Cumulative Population %', position: 'insideBottom', offset: -5, fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        tickFormatter={(value) => value.toFixed(4)}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis 
                        stroke="#a1a1aa"
                        label={{ value: 'Cumulative Gain %', angle: -90, position: 'insideLeft', fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px', paddingTop: '10px' }} />
                      {/* Random baseline - diagonal line (y = x) */}
                      <Line 
                        type="linear" 
                        dataKey="randomBaseline" 
                        stroke="#71717a" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Random Baseline"
                        legendType="line"
                      />
                      {/* Model performance */}
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeGain" 
                        stroke="#3b82f6" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorGain)"
                        name="Model Cumulative Gain"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  {optimalCutoff && (
                    <div className="mt-3 text-xs text-zinc-400">
                      <span className="text-zinc-300 font-medium">Insight:</span> Targeting top {optimalCutoff.cumulativeDataPercent.toFixed(1)}% captures {optimalCutoff.cumulativeGain.toFixed(1)}% of positive responses
                      {top10Percent && top20Percent && (
                        <span className="ml-4">
                          • Top 10%: {top10Percent.cumulativeGain.toFixed(1)}% gain
                          • Top 20%: {top20Percent.cumulativeGain.toFixed(1)}% gain
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Lift Chart with Baseline */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-white mb-1">Lift Chart</h4>
                      <p className="text-xs text-zinc-500">
                        Measures how much better the model performs compared to random selection (baseline = 1.0)
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="cumulativeDataPercent" 
                        stroke="#a1a1aa"
                        label={{ value: 'Cumulative Population %', position: 'insideBottom', offset: -5, fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        tickFormatter={(value) => value.toFixed(4)}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis 
                        stroke="#a1a1aa"
                        label={{ value: 'Lift', angle: -90, position: 'insideLeft', fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px', paddingTop: '10px' }} />
                      {/* Baseline at 1.0 - random targeting performance */}
                      <ReferenceLine 
                        y={1.0} 
                        stroke="#71717a" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lift" 
                        stroke="#10b981" 
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 3.5 }}
                        activeDot={{ r: 5 }}
                        name="Lift"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeLift" 
                        stroke="#8b5cf6" 
                        strokeWidth={2.5}
                        dot={{ fill: '#8b5cf6', r: 3.5 }}
                        activeDot={{ r: 5 }}
                        name="Cumulative Lift"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-zinc-400">
                    <span className="text-zinc-300 font-medium">Interpretation:</span> Higher lift values indicate better model performance. A lift of {chartData[0]?.lift.toFixed(2)} means the model is {chartData[0]?.lift.toFixed(1)}x better than random targeting.
                  </div>
                </div>

                {/* Response Rate vs Population */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-white mb-1">Response Rate vs Population</h4>
                      <p className="text-xs text-zinc-500">
                        Shows how response rate changes across different population segments
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="cumulativeDataPercent" 
                        stroke="#a1a1aa"
                        label={{ value: 'Cumulative Population %', position: 'insideBottom', offset: -5, fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        tickFormatter={(value) => value.toFixed(4)}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis 
                        stroke="#a1a1aa"
                        label={{ value: 'Response Rate %', angle: -90, position: 'insideLeft', fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px', paddingTop: '10px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="responseRate" 
                        stroke="#f59e0b" 
                        strokeWidth={2.5}
                        dot={{ fill: '#f59e0b', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Response Rate %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Capture Rate Curve */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-white mb-1">Capture Rate Curve</h4>
                      <p className="text-xs text-zinc-500">
                        Percentage of positive responses captured at each population segment
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis 
                        dataKey="cumulativeDataPercent" 
                        stroke="#a1a1aa"
                        label={{ value: 'Cumulative Population %', position: 'insideBottom', offset: -5, fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        tickFormatter={(value) => value.toFixed(4)}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis 
                        stroke="#a1a1aa"
                        label={{ value: 'Capture Rate %', angle: -90, position: 'insideLeft', fill: '#a1a1aa', style: { fontSize: '12px' } }}
                        tick={{ fill: '#a1a1aa', fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px', paddingTop: '10px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="captureRate" 
                        stroke="#ef4444" 
                        strokeWidth={2.5}
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Capture Rate %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-xs text-zinc-400">
                    <span className="text-zinc-300 font-medium">Business Insight:</span> Higher capture rates in early segments indicate the model successfully identifies high-value targets. Consider focusing campaigns on top 10-20% segments.
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
