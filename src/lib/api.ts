import type { 
  InferenceRequest, 
  InferenceResponse, 
  UploadRequest, 
  UploadResponse, 
  StatusResponse, 
  CalibrationData,
 
} from '../types/api';

// Updated to point to Flask backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true' || false; // Default to false for Flask backend

class ApiClient {
  private baseUrl: string;
  private mockMode: boolean;

  constructor(baseUrl: string = API_BASE_URL, mockMode: boolean = MOCK_MODE) {
    this.baseUrl = baseUrl;
    this.mockMode = mockMode;
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // private generateMockHeatmap(): number[] {
  //   // Generate a 256x256 heatmap array with realistic morphing patterns
  //   const size = 256;
  //   const heatmap = new Array(size * size);
    
  //   for (let y = 0; y < size; y++) {
  //     for (let x = 0; x < size; x++) {
  //       const idx = y * size + x;
  //       // Create hotspots around facial regions (eyes, nose, mouth)
  //       const eyeLeft = Math.exp(-((x - 80) ** 2 + (y - 80) ** 2) / 800);
  //       const eyeRight = Math.exp(-((x - 176) ** 2 + (y - 80) ** 2) / 800);
  //       const nose = Math.exp(-((x - 128) ** 2 + (y - 120) ** 2) / 600);
  //       const mouth = Math.exp(-((x - 128) ** 2 + (y - 180) ** 2) / 1000);
        
  //       const base = Math.random() * 0.1;
  //       const anomaly = Math.max(eyeLeft, eyeRight, nose, mouth) * (0.3 + Math.random() * 0.7);
  //       heatmap[idx] = Math.min(1, base + anomaly);
  //     }
  //   }
    
  //   return heatmap;
  // }

  // Health check for Flask backend
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: 'Connection failed' };
    }
  }

  // New morph detection endpoint for Flask backend
  async analyzeImage(file: File): Promise<any> {
    if (this.mockMode) {
      await this.delay(1500 + Math.random() * 1000);
      
      const isMorph = Math.random() > 0.6;
      const rawLogit = isMorph ? 1.5 + Math.random() * 2.0 : -1.0 - Math.random() * 1.5;
      
      return {
        status: 'success',
        analysis_id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        filename: file.name,
        result: {
          raw_logit: rawLogit,
          predicted_class: isMorph ? 1 : 0,
          class_name: isMorph ? 'MORPHED' : 'GENUINE',
          
          model: 'SelfMAD EFFICIENTNET-B7 (Mock)'
        },
        interpretation: {
          is_morphed: isMorph,
          risk_level: Math.abs(rawLogit) > 2.0 ? 'HIGH' : Math.abs(rawLogit) > 1.0 ? 'MEDIUM' : 'LOW'
        }
      };
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  }

  // Base64 image analysis for Flask backend
  async analyzeImageBase64(base64Data: string): Promise<any> {
    if (this.mockMode) {
      await this.delay(1500 + Math.random() * 1000);
      
      const isMorph = Math.random() > 0.6;
      const rawLogit = isMorph ? 1.5 + Math.random() * 2.0 : -1.0 - Math.random() * 1.5;
      
      return {
        status: 'success',
        analysis_id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        result: {
          raw_logit: rawLogit,
          predicted_class: isMorph ? 1 : 0,
          class_name: isMorph ? 'MORPHED' : 'GENUINE',
          
          model: 'SelfMAD EFFICIENTNET-B7 (Mock)'
        },
        interpretation: {
          is_morphed: isMorph,
          risk_level: Math.abs(rawLogit) > 2.0 ? 'HIGH' : Math.abs(rawLogit) > 1.0 ? 'MEDIUM' : 'LOW'
        }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/analyze-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Base64 image analysis failed:', error);
      throw error;
    }
  }

  // Get analysis history from Flask backend
  async getHistory(): Promise<any> {
    if (this.mockMode) {
      await this.delay(500);
      return {
        status: 'success',
        history: [
          {
            id: '1',
            filename: 'sample1.jpg',
            timestamp: '2024-01-15T10:30:00Z',
            result: 'GENUINE',
            confidence: 0.85
          },
          {
            id: '2',
            filename: 'sample2.jpg',
            timestamp: '2024-01-15T11:15:00Z',
            result: 'MORPHED',
            confidence: 0.92
          }
        ]
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/history`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async upload(request: UploadRequest): Promise<UploadResponse> {
    // Redirect to new analyzeImage method
    return this.analyzeImage(request.file);
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    // Convert to new format and use analyzeImageBase64
    const base64Data = request.image_b64;
    const result = await this.analyzeImageBase64(base64Data);
    
    // Convert Flask response to legacy format
    return {
      is_morph: result.interpretation.is_morphed,
      score_fused: result.result.confidence / 3.0, // Normalize to 0-1 range
      score_classifier: result.result.confidence / 3.0,
      score_recon: result.result.confidence / 3.0,
      heatmap_array_base64: '', // Flask backend doesn't provide heatmaps yet
      regions: [], // Flask backend doesn't provide regions yet
      processing_time_ms: 1200 + Math.random() * 800
    };
  }

  async getStatus(_jobId: string): Promise<StatusResponse> {
    // For Flask backend, jobs are processed immediately
    return {
      status: 'done',
      result: {
        is_morph: false,
        score_fused: 0.5,
        score_classifier: 0.5,
        score_recon: 0.5,
        heatmap_url: undefined,
        heatmap_array_base64: undefined,
        regions: [],
        processing_time_ms: 1000
      }
    };
  }

  async getCalibrationData(): Promise<CalibrationData> {
    // Mock calibration data
    return {
      threshold: 0.5,
      histogram: [10, 20, 30, 40, 50],
      recommended_threshold: 0.6,
      sample_count: 100
    };
  }

  async updateCalibration(data: Partial<CalibrationData>): Promise<void> {
    // Mock calibration update
    console.log('Calibration updated:', data);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };