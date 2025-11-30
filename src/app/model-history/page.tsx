'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Button } from '@/components/ui';
import { PaperPlaneIcon } from "@radix-ui/react-icons";

// Type definitions for the API response
interface DatasetShape {
  rows: number;
  columns: number;
}

interface SessionMetadata {
  session_id: string;
  created_at: string;
  status: string;
  data_path: string;
  original_filename: string;
  dataset_shape: DatasetShape;
  target_variable: string;
  max_runtime_secs: number;
  model_name: string;
  user_instructions: string;
  exclude_columns: string[];
  model_path: string | null;
  num_models: number | null;
  error?: string;
  user_id: string;
}

interface Artifacts {
  model_object_key: string | null;
  session_object_key: string | null;
  has_model: boolean;
  has_session_data: boolean;
}

interface Session {
  session_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: SessionMetadata;
  performance: {
    auc?: number;
    logloss?: number;
  } | null;
  artifacts: Artifacts;
  model_info: {
    target_variable: string;
    original_filename: string;
    model_path: string | null;
    num_models: number | null;
  };
}

interface StatusCounts {
  completed: number;
  failed: number;
}

interface ModelHistoryResponse {
  status: string;
  user_id: string;
  total_sessions: number;
  status_counts: StatusCounts;
  sessions: Session[];
  note: string;
}

export default function ModelHistory() {
  const router = useRouter();
  const { userId, isLoading: authLoading } = useAuth();
  
  const [data, setData] = useState<ModelHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelHistory = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const url = buildApiUrl(`/api/model-training/model-history/${userId}`);
        console.log('Fetching model history from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          let errorDetail = '';
          try {
            const errData = await response.json();
            errorDetail = errData.detail || errData.message || '';
          } catch (e) {
            // Ignore JSON parse error
          }
          throw new Error(`HTTP error! status: ${response.status}${errorDetail ? ` - ${errorDetail}` : ''}`);
        }
        
        const result: ModelHistoryResponse = await response.json();
        
        if (result.status === 'success') {
          setData(result);
        } else {
          throw new Error('Failed to fetch model history data');
        }
      } catch (error) {
        console.error('Error fetching model history:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch model history data');
      } finally {
        setLoading(false);
      }
    };

    fetchModelHistory();
  }, [userId, authLoading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDisplayStatus = (session: Session) => {
    // If no model created means Failed, as per requirement
    if (!session.artifacts.has_model) {
      return 'Failed';
    }
    // Capitalize first letter
    return session.status.charAt(0).toUpperCase() + session.status.slice(1);
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'failed') {
      return 'text-red-400';
    }
    if (normalizedStatus === 'completed') {
      return 'text-green-400';
    }
    return 'text-zinc-400';
  };

  const derivedCounts = useMemo(() => {
    if (!data?.sessions) return { completed: 0, failed: 0, total: 0 };
    
    let completed = 0;
    let failed = 0;
    
    data.sessions.forEach(session => {
      const status = getDisplayStatus(session).toLowerCase();
      if (status === 'completed') {
        completed++;
      } else {
        // Anything not completed (mostly 'failed' due to getDisplayStatus logic) counts as failed
        failed++;
      }
    });
    
    return {
      total: data.sessions.length,
      completed,
      failed
    };
  }, [data]);

  const handleRowClick = (sessionId: string, status: string) => {
    // Only allow navigation if status is not failed
    if (status.toLowerCase() === 'failed') {
      return;
    }
    router.push(`/model-detail?session_id=${sessionId}`);
  };

  const handleTestModel = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent row click
    router.push(`/playground?session_id=${sessionId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-zinc-400">Loading model history...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-zinc-400">Please log in to view model history</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <NavBar />
        <div className="flex-grow flex items-center justify-center flex-col gap-4">
          <div className="text-red-400">Error: {error}</div>
          <div className="text-zinc-500 text-sm">User ID: {userId}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white transition"
          >
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <NavBar />
      <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Model Training History</h1>
            <p className="text-zinc-400">Overview of your model training sessions</p>
          </div>
          {data && (
            <div className="flex space-x-4">
              <div className="bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 w-32 flex flex-col items-center justify-center">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Total Sessions</div>
                <div className="text-xl font-bold text-white">{derivedCounts.total}</div>
              </div>
              <div className="bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 w-32 flex flex-col items-center justify-center">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Completed</div>
                <div className="text-xl font-bold text-green-400">{derivedCounts.completed}</div>
              </div>
              <div className="bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 w-32 flex flex-col items-center justify-center">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Failed</div>
                <div className="text-xl font-bold text-red-400">{derivedCounts.failed}</div>
              </div>
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="py-4 px-6 font-medium text-zinc-400">Timestamp</th>
                  <th className="py-4 px-6 font-medium text-zinc-400">Status</th>
                  <th className="py-4 px-6 font-medium text-zinc-400">Session ID</th>
                  <th className="py-4 px-6 font-medium text-zinc-400">Dataset Name</th>
                  <th className="py-4 px-6 font-medium text-zinc-400">Target Variable</th>
                  <th className="py-4 px-6 font-medium text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data?.sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No training history found
                    </td>
                  </tr>
                ) : (
                  data?.sessions.map((session) => {
                    const displayStatus = getDisplayStatus(session);
                    const isFailed = displayStatus.toLowerCase() === 'failed';
                    
                    return (
                      <tr 
                        key={session.session_id} 
                        onClick={() => handleRowClick(session.session_id, displayStatus)}
                        className={`transition-colors group ${
                          isFailed 
                            ? 'cursor-not-allowed opacity-75' 
                            : 'cursor-pointer hover:bg-zinc-900/50'
                        }`}
                      >
                        <td className="py-4 px-6 text-zinc-300">
                          {formatDate(session.created_at)}
                        </td>
                        <td className={`py-4 px-6 font-medium ${getStatusColor(displayStatus)}`}>
                          {displayStatus}
                        </td>
                        <td className="py-4 px-6 font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
                          {session.session_id}
                        </td>
                        <td className="py-4 px-6 text-zinc-300">
                          {session.metadata.original_filename}
                        </td>
                        <td className="py-4 px-6 text-zinc-300">
                          <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                            {session.metadata.target_variable}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isFailed && (
                            <Button
                              variant="outline"
                              className="cursor-pointer hover:bg-zinc-800 border-zinc-700"
                              onClick={(e) => handleTestModel(e, session.session_id)}
                              icon={<PaperPlaneIcon className="w-3 h-3" />}
                            >
                              Test Model
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
