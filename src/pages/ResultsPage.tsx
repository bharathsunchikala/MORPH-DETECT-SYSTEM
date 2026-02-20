import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share, Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import type { FlaskAnalysisResult } from '../types/api';

interface ResultsPageProps {
  result: FlaskAnalysisResult | null;
  originalImage: string;
  onNavigate: (page: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, originalImage, onNavigate }) => {
  const [userDecision, setUserDecision] = useState<'accept' | 'reject' | 'review' | null>(null);

  if (!result || !originalImage) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-h2 font-bold text-text-primary mb-4">No Results Available</h1>
          <p className="text-text-muted mb-8">Please analyze an image first to see results.</p>
          <motion.button
            onClick={() => onNavigate('analyze')}
            className="bg-accent-1 text-bg font-semibold py-3 px-6 rounded-lg hover:bg-accent-1/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Analyze Image
          </motion.button>
        </div>
      </div>
    );
  }

  const handleDecision = (decision: 'accept' | 'reject' | 'review') => {
    setUserDecision(decision);
    // In a real app, you would send this to the backend
    console.log('User decision:', decision, { result });
  };

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      result,
      userDecision,
      analysis_id: result.analysis_id,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morphdetect-report-${result.analysis_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get result details
  const isMorphed = result.interpretation.is_morphed;
  
  const riskLevel = result.interpretation.risk_level;
  const modelName = result.result.model;
  const timestamp = new Date(result.timestamp);

  // Get risk level color and icon
  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { color: 'text-danger', bgColor: 'bg-danger/10', borderColor: 'border-danger/20', icon: AlertTriangle };
      case 'MEDIUM':
        return { color: 'text-warning', bgColor: 'bg-warning/10', borderColor: 'border-warning/20', icon: AlertTriangle };
      case 'LOW':
        return { color: 'text-success', bgColor: 'bg-success/10', borderColor: 'border-success/20', icon: CheckCircle };
      default:
        return { color: 'text-text-muted', bgColor: 'bg-white/5', borderColor: 'border-white/10', icon: CheckCircle };
    }
  };

  const riskInfo = getRiskLevelInfo(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => onNavigate('analyze')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-h2 font-bold text-text-primary">Analysis Results</h1>
              <p className="text-text-muted">
                Analyzed on {timestamp.toLocaleDateString()} at {timestamp.toLocaleTimeString()} • {modelName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={downloadReport}
              className="btn-secondary flex items-center space-x-2 px-4 py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </motion.button>
            
            <motion.button
              className="btn-ghost flex items-center space-x-2 px-4 py-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </motion.button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Result Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-6 ${riskInfo.bgColor} ${riskInfo.borderColor} border`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${riskInfo.bgColor}`}>
                    <RiskIcon className={`w-6 h-6 ${riskInfo.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {isMorphed ? 'Morphing Detected' : 'No Morphing Detected'}
                    </h2>
                    <p className="text-text-muted">
                      Analysis ID: {result.analysis_id}
                    </p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${riskInfo.bgColor} ${riskInfo.color}`}>
                  {riskLevel} RISK
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Detection Results</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Classification:</span>
                      <span className={`font-medium ${isMorphed ? 'text-danger' : 'text-success'}`}>
                        {result.result.class_name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-muted">Raw Logit:</span>
                      <span className="font-medium text-text-primary">
                        {result.result.raw_logit.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Model Information</h3>
                  <div className="space-y-3">
                    
                    <div className="flex justify-between">
                      <span className="text-text-muted">Analysis Time:</span>
                      <span className="font-medium text-text-primary">
                        {timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Risk Assessment:</span>
                      <span className={`font-medium ${riskInfo.color}`}>
                        {riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Analyzed Image</h3>
              <div className="relative">
                <img
                  src={originalImage}
                  alt="Analyzed image"
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
                {result.filename && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {result.filename}
                  </div>
                )}
              </div>
            </motion.div>

            {/* User Decision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Review Decision</h3>
              <p className="text-text-muted mb-4">
                Based on the analysis results, please provide your decision:
              </p>
              
              <div className="flex space-x-4">
                <motion.button
                  onClick={() => handleDecision('accept')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userDecision === 'accept' 
                      ? 'bg-success text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-text-muted'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Result</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleDecision('reject')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userDecision === 'reject' 
                      ? 'bg-danger text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-text-muted'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Result</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleDecision('review')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userDecision === 'review' 
                      ? 'bg-warning text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-text-muted'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Flag className="w-4 h-4" />
                  <span>Flag for Review</span>
                </motion.button>
              </div>
              
              {userDecision && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-text-muted">
                    Decision: <span className="font-medium text-text-primary">{userDecision.toUpperCase()}</span>
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-text-primary mb-1">
                    {isMorphed ? 'MORPHED' : 'GENUINE'}
                  </div>
                  <div className="text-sm text-text-muted">Classification</div>
                </div>
                
                
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className={`text-2xl font-bold mb-1 ${riskInfo.color}`}>
                    {riskLevel}
                  </div>
                  <div className="text-sm text-text-muted">Risk Level</div>
                </div>
              </div>
            </motion.div>

            {/* Analysis Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Analysis Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Analysis ID:</span>
                  <span className="text-text-primary font-mono text-xs">
                    {result.analysis_id.slice(0, 8)}...
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Timestamp:</span>
                  <span className="text-text-primary">
                    {timestamp.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Model:</span>
                  <span className="text-text-primary text-xs">
                    {modelName}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-muted">Raw Logit:</span>
                  <span className="text-text-primary font-mono">
                    {result.result.raw_logit.toFixed(4)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-4">Recommendations</h3>
              
              <div className="space-y-3 text-sm">
                {isMorphed ? (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
                    <p className="text-danger font-medium mb-2">⚠️ Morphing Detected</p>
                    <p className="text-danger/80 text-xs">
                      This image shows signs of digital manipulation. Consider additional verification.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-success font-medium mb-2">✅ No Morphing Detected</p>
                    <p className="text-success/80 text-xs">
                      This image appears to be genuine with no signs of manipulation.
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-primary font-medium mb-2">💡 Next Steps</p>
                  <ul className="text-text-muted/80 text-xs space-y-1">
                    <li>• Review the analysis results carefully</li>
                    <li>• Consider additional verification if needed</li>
                    <li>• Document your decision for audit purposes</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};