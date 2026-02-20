import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Flag } from 'lucide-react';
import type { FlaskAnalysisResult } from '../types/api';

interface ResultSummaryCardProps {
  result: FlaskAnalysisResult;
  onDecision: (decision: 'accept' | 'reject' | 'review') => void;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ result, onDecision }) => {
  const isMorphed = result.interpretation.is_morphed;
  
  const riskLevel = result.interpretation.risk_level;

  // Get risk level styling
  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          color: 'text-danger',
          bgColor: 'bg-danger/10',
          borderColor: 'border-danger/20',
          icon: AlertTriangle
        };
      case 'MEDIUM':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          icon: AlertTriangle
        };
      case 'LOW':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          icon: CheckCircle
        };
      default:
        return {
          color: 'text-text-muted',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          icon: CheckCircle
        };
    }
  };

  const riskStyle = getRiskLevelStyle(riskLevel);
  const RiskIcon = riskStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 ${riskStyle.bgColor} ${riskStyle.borderColor} border`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${riskStyle.bgColor}`}>
            <RiskIcon className={`w-5 h-5 ${riskStyle.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {isMorphed ? 'Morphing Detected' : 'No Morphing Detected'}
            </h3>
            
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${riskStyle.bgColor} ${riskStyle.color}`}>
          {riskLevel} RISK
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <div className="text-xl font-bold text-text-primary">
            {isMorphed ? 'MORPHED' : 'GENUINE'}
          </div>
          <div className="text-xs text-text-muted">Classification</div>
        </div>
        
        
      </div>

      {/* Decision Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">Your Decision:</h4>
        
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            onClick={() => onDecision('accept')}
            className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-success/10 hover:bg-success/20 text-success border border-success/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Accept</span>
          </motion.button>
          
          <motion.button
            onClick={() => onDecision('reject')}
            className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <XCircle className="w-4 h-4" />
            <span className="text-xs">Reject</span>
          </motion.button>
          
          <motion.button
            onClick={() => onDecision('review')}
            className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Flag className="w-4 h-4" />
            <span className="text-xs">Review</span>
          </motion.button>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-text-muted space-y-1">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-text-primary">{result.result.model}</span>
          </div>
          <div className="flex justify-between">
            <span>Analysis ID:</span>
            <span className="text-text-primary font-mono">
              {result.analysis_id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span>Raw Logit:</span>
            <span className="text-text-primary font-mono">
              {result.result.raw_logit.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};