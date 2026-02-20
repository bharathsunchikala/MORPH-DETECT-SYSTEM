import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, BarChart3, Target, Download, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api';
import type { CalibrationData } from '../types/api';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThresholdUpdate?: (threshold: number) => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  onThresholdUpdate
}) => {
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState(0.5);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCalibrationData();
    }
  }, [isOpen]);

  const loadCalibrationData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCalibrationData();
      setCalibrationData(data);
      setSelectedThreshold(data.recommended_threshold);
    } catch (error) {
      console.error('Failed to load calibration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesSelect = (files: FileList) => {
    setUploadedFiles(Array.from(files));
  };

  const runCalibration = async () => {
    if (uploadedFiles.length === 0) return;
    
    setLoading(true);
    // In a real implementation, this would upload the files and run calibration
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadCalibrationData();
  };

  const applyThreshold = () => {
    onThresholdUpdate?.(selectedThreshold);
    onClose();
  };

  const downloadReport = () => {
    if (!calibrationData) return;
    
    const report = {
      threshold: selectedThreshold,
      recommended_threshold: calibrationData.recommended_threshold,
      sample_count: calibrationData.sample_count,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calibration-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card-bg backdrop-blur-md border border-card-border rounded-card-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-card-border">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Threshold Calibration</h2>
              <p className="text-text-muted text-sm">Optimize detection threshold using bona-fide samples</p>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload Section */}
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-text-primary mb-4">Upload Bona-fide Images</h3>
              <div className="border-2 border-dashed border-card-border rounded-lg p-8 text-center hover:border-accent-1/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
                  className="hidden"
                  id="calibration-upload"
                />
                <label htmlFor="calibration-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h4 className="font-medium text-text-primary mb-2">Upload Multiple Images</h4>
                  <p className="text-text-muted text-sm">
                    Select 50+ bona-fide (authentic) images for optimal calibration
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-text-muted mb-2">{uploadedFiles.length} files selected</p>
                  <motion.button
                    onClick={runCalibration}
                    disabled={loading}
                    className="bg-accent-1 text-bg font-medium py-2 px-4 rounded-lg hover:bg-accent-1/90 disabled:opacity-50 transition-colors"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? 'Processing...' : 'Run Calibration'}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Results Section */}
            {calibrationData && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Histogram */}
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary">Score Distribution</h3>
                    <BarChart3 className="w-5 h-5 text-accent-1" />
                  </div>
                  
                  <div className="relative h-48 mb-4">
                    <svg className="w-full h-full">
                      {calibrationData.histogram.map((value, index) => {
                        const x = (index / calibrationData.histogram.length) * 100;
                        const height = (value / Math.max(...calibrationData.histogram)) * 80;
                        const isSelected = (index / calibrationData.histogram.length) > selectedThreshold;
                        
                        return (
                          <rect
                            key={index}
                            x={`${x}%`}
                            y={`${80 - height}%`}
                            width={`${100 / calibrationData.histogram.length}%`}
                            height={`${height}%`}
                            fill={isSelected ? '#ff6b6b' : '#7ce7ff'}
                            opacity={0.7}
                          />
                        );
                      })}
                      {/* Threshold line */}
                      <line
                        x1={`${selectedThreshold * 100}%`}
                        y1="0%"
                        x2={`${selectedThreshold * 100}%`}
                        y2="100%"
                        stroke="#a084ff"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                      />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Sample Count:</span>
                      <span className="text-text-primary">{calibrationData.sample_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Recommended:</span>
                      <span className="text-success">{(calibrationData.recommended_threshold * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Threshold Controls */}
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary">Threshold Selection</h3>
                    <Target className="w-5 h-5 text-accent-2" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-text-primary mb-3">
                        <span>Detection Threshold</span>
                        <span className="text-accent-1 text-lg font-bold">
                          {(selectedThreshold * 100).toFixed(0)}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedThreshold}
                        onChange={(e) => setSelectedThreshold(parseFloat(e.target.value))}
                        className="w-full accent-accent-1"
                      />
                      <div className="flex justify-between text-xs text-text-dim mt-2">
                        <span>0%</span>
                        <span className="text-success">
                          Recommended: {(calibrationData.recommended_threshold * 100).toFixed(0)}%
                        </span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                        <div>
                          <h4 className="font-medium text-text-primary text-sm mb-1">Threshold Impact</h4>
                          <ul className="text-xs text-text-muted space-y-1">
                            <li>• Lower = More sensitive (fewer false negatives)</li>
                            <li>• Higher = More specific (fewer false positives)</li>
                            <li>• Recommended value balances precision/recall</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        onClick={() => setSelectedThreshold(calibrationData.recommended_threshold)}
                        className="flex-1 bg-success/20 text-success border border-success/30 font-medium py-2 px-4 rounded-lg hover:bg-success/30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Use Recommended
                      </motion.button>
                      <motion.button
                        onClick={downloadReport}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-1 mx-auto mb-2"></div>
                <p className="text-text-muted">Processing calibration data...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-card-border">
            <div className="text-sm text-text-muted">
              Calibration helps optimize detection accuracy for your specific use case
            </div>
            <div className="flex space-x-3">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={applyThreshold}
                className="px-6 py-2 rounded-lg bg-accent-1 text-bg font-medium hover:bg-accent-1/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Threshold
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};