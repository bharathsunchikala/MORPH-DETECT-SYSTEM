// Flask Backend API Types
export interface FlaskAnalysisResult {
  status: 'success' | 'error';
  analysis_id: string;
  timestamp: string;
  filename?: string;
  result: {
    raw_logit: number;
    predicted_class: number;
    class_name: 'MORPHED' | 'GENUINE';
    confidence: number;
    model: string;
  };
  interpretation: {
    is_morphed: boolean;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  error?: string;
}

// Legacy API Types (for backward compatibility)
export interface InferenceRequest {
  image_b64: string;
}

export interface InferenceResponse {
  is_morph: boolean;
  score_fused: number;
  score_classifier: number;
  score_recon: number;
  heatmap_url?: string;
  heatmap_array_base64?: string;
  regions: Region[];
  processing_time_ms: number;
}

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
}

export interface UploadRequest {
  file: File;
}

export interface UploadResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'done' | 'error';
}

export interface StatusResponse {
  status: 'queued' | 'processing' | 'done' | 'error';
  result_url?: string;
  result?: InferenceResponse;
}

export interface CalibrationData {
  threshold: number;
  histogram: number[];
  recommended_threshold: number;
  sample_count: number;
}

export interface HistoryItem {
  id: string;
  timestamp: Date;
  filename: string;
  result: InferenceResponse;
  thumbnail_url: string;
  user_decision?: 'accept' | 'reject' | 'review';
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'error';
  timestamp: string;
  model_loaded: boolean;
  model_type: string;
  model_available: boolean;
  server_version: string;
  error?: string;
}