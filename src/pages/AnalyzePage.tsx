import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCard } from '../components/UploadCard';
import { apiClient } from '../lib/api';
import type { FlaskAnalysisResult } from '../types/api';
import { ArrowLeft } from 'lucide-react';

interface AnalyzePageProps {
  onResult: (result: FlaskAnalysisResult, originalImage: string) => void;
  onNavigate: (page: string) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onResult, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>('');
  // advanced settings removed
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check backend connection on component mount
  React.useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const health = await apiClient.healthCheck();
      if (health.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const handleFileSelect = (file: File) => {
    // Set local state and create preview
    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const preview = e.target?.result as string;
      setOriginalImage(preview);

      // Immediately upload/analyze the image after preview is available
      setIsLoading(true);
      try {
        const result = await apiClient.analyzeImage(file);
        if (result.status === 'success') {
          onResult(result, preview);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (typeof onNavigate === 'function') {
        onNavigate('home');
        return;
      }
    } catch (err) {
      // ignore and fallback
    }
    // Fallback to browser history
    if (window && typeof window.history !== 'undefined') {
      window.history.back();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !originalImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the new Flask backend API
      const result = await apiClient.analyzeImage(selectedFile);
      
      if (result.status === 'success') {
        onResult(result, originalImage);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handleBack}
              aria-label="Go back"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-h2 font-bold text-text-primary">Image Analysis</h1>
              <p className="text-text-muted">Upload an image to detect morphing attacks</p>
              
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-success' : 
                  backendStatus === 'checking' ? 'bg-warning' : 'bg-danger'
                }`} />
                <span className="text-sm text-text-dim">
                  {backendStatus === 'connected' ? 'Backend Connected' :
                   backendStatus === 'checking' ? 'Checking Backend...' : 'Backend Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            <UploadCard
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              originalImage={originalImage}
              onClear={() => {
                setSelectedFile(null);
                setOriginalImage('');
                setError(null);
              }}
            />

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-danger/10 border border-danger/20 rounded-lg p-4"
              >
                <p className="text-danger text-sm">{error}</p>
              </motion.div>
            )}

            {/* Analysis Button */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isLoading || backendStatus !== 'connected'}
                  className={`btn-primary px-12 py-4 text-lg font-semibold ${
                    backendStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={backendStatus === 'connected' ? { scale: 1.02, y: -2 } : {}}
                  whileTap={backendStatus === 'connected' ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <span>Analyze Image</span>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Backend Connection Warning */}
            {backendStatus === 'disconnected' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-warning/10 border border-warning/20 rounded-lg p-4"
              >
                <p className="text-warning text-sm">
                  ⚠️ Backend server is not connected. Please ensure the Flask server is running on port 5000.
                </p>
                <button
                  onClick={checkBackendConnection}
                  className="text-warning/80 hover:text-warning text-sm underline mt-2"
                >
                  Retry Connection
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Advanced Settings removed */}

            {/* Analysis Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Analysis Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Backend Status:</span>
                  <span className={`font-medium ${
                    backendStatus === 'connected' ? 'text-success' : 
                    backendStatus === 'checking' ? 'text-warning' : 'text-danger'
                  }`}>
                    {backendStatus === 'connected' ? 'Connected' :
                     backendStatus === 'checking' ? 'Checking...' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Model Type:</span>
                  <span className="text-text-primary">EfficientNet-B7</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Max File Size:</span>
                  <span className="text-text-primary">16MB</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Supported Formats:</span>
                  <span className="text-text-primary">JPG, PNG, GIF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};