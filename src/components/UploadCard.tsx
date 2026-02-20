import React, { useState, useRef } from 'react';
import { Upload, Image, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  originalImage: string;
  onClear: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ 
  onFileSelect, 
  selectedFile,
  originalImage,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Simple file input change handler
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      onFileSelect(file);
  setSelectedName(file.name);

      // Clear the input value so selecting the same file again will trigger change
      // Use setTimeout to ensure any parent FileReader usage finishes first.
      setTimeout(() => {
        if (event && event.target) (event.target as HTMLInputElement).value = '';
      }, 0);
    }
  };

  // (removed programmatic browse click — label-for-input handles opening reliably)

  // Simple drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      console.log('File dropped:', file.name, file.size, file.type);
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('Please select an image file (JPG, PNG, GIF, BMP, TIFF)');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityAssessment = (file: File) => {
    const assessments = [];
    
    // File size check
    if (file.size < 5 * 1024 * 1024) {
      assessments.push({ label: 'File Size', status: 'good', value: formatFileSize(file.size) });
    } else if (file.size < 16 * 1024 * 1024) {
      assessments.push({ label: 'File Size', status: 'warning', value: formatFileSize(file.size) + ' (Large)' });
    } else {
      assessments.push({ label: 'File Size', status: 'error', value: formatFileSize(file.size) + ' (Too Large)' });
    }
    
    // File type check
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
    if (validTypes.includes(file.type)) {
      assessments.push({ label: 'File Type', status: 'good', value: file.type.split('/')[1].toUpperCase() });
    } else {
      assessments.push({ label: 'File Type', status: 'error', value: 'Unsupported' });
    }
    
    return assessments;
  };

  // File preview view
  if (selectedFile && originalImage) {
    const qualityAssessments = getQualityAssessment(selectedFile);
    
    return (
      <div className="card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Selected Image</h3>
          <p className="text-sm text-text-muted mt-1">Preview of the image you selected for analysis. Review the file information and quality before proceeding.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div>
            <div className="relative">
              <img 
                src={originalImage} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg border border-white/10"
              />
            </div>
          </div>
          
      {/* File Information */}
      <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-semibold text-text-primary mb-3">File Information</h4>
        <p className="text-xs text-text-muted mb-3 truncate" title={selectedFile.name}>{selectedFile.name}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Name:</span>
                  <span className="text-text-primary font-medium truncate ml-2 max-w-32" title={selectedFile.name}>
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Size:</span>
                  <span className="text-text-primary">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Type:</span>
                  <span className="text-text-primary uppercase">{selectedFile.type.split('/')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Modified:</span>
                  <span className="text-text-primary">{new Date(selectedFile.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quality Assessment */}
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Quality Assessment</span>
              </h4>
              <div className="space-y-2">
                {qualityAssessments.map((assessment, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-text-muted text-sm">{assessment.label}:</span>
                    <span className={`text-sm font-medium ${
                      assessment.status === 'good' ? 'text-success' : 
                      assessment.status === 'warning' ? 'text-warning' : 'text-danger'
                    }`}>
                      {assessment.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Remove button */}
            <div className="mt-2">
              <button
                onClick={onClear}
                className="text-sm text-danger underline hover:text-danger/80"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent-1/10 border border-accent-1/20 rounded-lg">
          <p className="text-sm text-text-primary">
            <strong>Ready for analysis:</strong> Your image meets the quality requirements for accurate morphing detection.
          </p>
        </div>
      </div>
    );
  }

  // Upload interface
  return (
    <div className="space-y-6">
      {/* Main Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative card border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300
          ${isDragOver ? 'border-accent-1 bg-accent-1/5' : 'border-white/8 hover:border-accent-1/50 hover:bg-white/5'}
        `}
        style={{
          transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
          borderColor: isDragOver ? '#7ce7ff' : 'rgba(255,255,255,0.08)'
        }}
      >
        <div className="space-y-4">
          <div 
            className="mx-auto w-16 h-16 bg-accent-1/10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: isDragOver ? 'rgba(124, 231, 255, 0.2)' : 'rgba(124, 231, 255, 0.1)',
              transform: isDragOver ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <Upload className={`w-8 h-8 transition-colors ${
              isDragOver ? 'text-accent-1' : 'text-text-muted'
            }`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragOver ? 'Drop image here' : 'Upload Image for Analysis'}
            </h3>
            <p className="text-text-muted">
              Drag and drop an image file, or click the button below to browse
            </p>
            <p className="text-sm text-text-dim mt-2">
              Supports JPG, PNG, GIF, BMP, TIFF • Max 16MB
            </p>
          </div>
        </div>
      </div>

      {/* File Upload Button */}
      <div className="text-center space-y-4">
        {/* Hidden (but clickable) file input. Use `sr-only` so it's not display:none — clicking programmatically
            on inputs hidden via display:none can be blocked in some browsers. Also keep it in the DOM for a11y. */}
        <input
          id="upload-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="sr-only pointer-events-auto"
        />
        
        
        
        {/* Main Upload Button: use a label targeting the hidden input for maximum reliability */}
        <label
          htmlFor="upload-input"
          className="btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg w-full max-w-xs mx-auto cursor-pointer relative hover:shadow-lg"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Image</span>
        </label>
        {/* Quick confirmation so user can see the browser actually selected a file */}
        {selectedName && (
          <div className="text-sm text-text-muted mt-2">Selected: <span className="font-medium text-text-primary">{selectedName}</span></div>
        )}
        
        <p className="text-sm text-text-muted">
          Click the button above to open file explorer and select an image
        </p>
      </div>

      {/* Reference Examples */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="w-full h-32 bg-success/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop" 
              alt="Bona-fide example"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <h4 className="font-medium text-success text-sm">Bona-fide</h4>
          </div>
          <p className="text-xs text-text-muted">Authentic, unmodified image</p>
        </div>
        
        <div className="text-center p-4 bg-danger/10 rounded-lg border border-danger/20">
          <div className="w-full h-32 bg-danger/20 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
            <img 
              src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop" 
              alt="Potential morph example"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Gradient overlay is now scoped to this container and won't capture pointer events */}
            <div className="absolute inset-0 bg-gradient-to-r from-danger/20 to-transparent pointer-events-none" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <AlertCircle className="w-4 h-4 text-danger" />
            <h4 className="font-medium text-danger text-sm">Potential Morph</h4>
          </div>
          <p className="text-xs text-text-muted">May show blending artifacts</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-medium text-text-primary text-sm mb-2 flex items-center space-x-2">
          <Image className="w-4 h-4" />
          <span>Best Practices</span>
        </h4>
        <ul className="text-xs text-text-muted space-y-1">
          <li>• Use high-resolution images (≥1024px) for best accuracy</li>
          <li>• Ensure good lighting and contrast</li>
          <li>• Front-facing portraits work best</li>
          <li>• Avoid heavily compressed or filtered images</li>
        </ul>
      </div>
    </div>
  );
};
