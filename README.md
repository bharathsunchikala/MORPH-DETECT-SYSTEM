# MorphDetect - Single-Image Morphing Attack Detection Frontend

A modern, production-ready React + TypeScript frontend for morphing attack detection, built with cutting-edge web technologies and designed for security professionals.

![MorphDetect Demo](https://via.placeholder.com/800x400/0f1724/7ce7ff?text=MorphDetect+Frontend)

## 🚀 Features

- **Fast Triage**: Sub-second inference with GPU acceleration support
- **Explainable Heatmaps**: Interactive pixel-level anomaly detection with overlay controls
- **Human-in-the-Loop**: Configurable thresholds, manual review workflows, and audit trails
- **3D Visualization**: WebGL-powered hero elements with graceful fallbacks
- **Responsive Design**: Desktop-first, fully responsive to mobile breakpoints
- **Production Ready**: Built for security teams with professional UX/UI

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with design tokens
- **3D Graphics**: react-three-fiber + drei
- **Animations**: Framer Motion
- **File Upload**: react-dropzone + MediaDevices API
- **Performance**: Lighthouse score >85 on mobile

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with WebGL support (optional for 3D features)

## 🏃‍♂️ Quick Start

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd morphdetect-frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5173`

The application runs in **mock mode** by default, providing realistic demo data for testing without a backend.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration (Production)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
VITE_MOCK_API=false

# Development (uses mock data)
VITE_MOCK_API=true
```

### Backend Integration

To connect to a real backend, update the API client configuration:

1. Set `VITE_MOCK_API=false` in your `.env`
2. Configure `VITE_API_BASE_URL` to point to your backend
3. Add your `VITE_API_KEY` for authentication

## 📡 API Contract

The frontend expects these endpoints:

### POST /api/v1/infer
**Synchronous inference**
```json
{
  "image_b64": "base64-encoded-image"
}
```

**Response:**
```json
{
  "is_morph": true,
  "score_fused": 0.72,
  "score_classifier": 0.65,
  "score_recon": 0.83,
  "heatmap_array_base64": "base64-encoded-float32-array",
  "regions": [{"x": 120, "y": 90, "w": 60, "h": 60, "score": 0.9}],
  "processing_time_ms": 1200
}
```

### POST /api/v1/upload
**Asynchronous processing**
```
multipart/form-data or JSON with base64
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "queued"
}
```

### GET /api/v1/status/{job_id}
```json
{
  "status": "done",
  "result": { /* InferenceResponse */ }
}
```

### GET /api/v1/calibration
```json
{
  "threshold": 0.5,
  "histogram": [/* float array */],
  "recommended_threshold": 0.65,
  "sample_count": 250
}
```

## 🎨 Design System

### Color Palette
```typescript
const colors = {
  bg: '#0f1724',           // Deep ink background
  cardBg: 'rgba(255,255,255,0.04)', // Glassmorphism cards
  accent1: '#7ce7ff',      // Cyan neon
  accent2: '#a084ff',      // Violet
  success: '#3ee1a7',      // Success green
  danger: '#ff6b6b',       // Danger red
  warning: '#ffd93d',      // Warning yellow
  muted: '#9aa4b2'         // Muted text
}
```

### Typography
- **Font**: Inter (primary), system fallbacks
- **Sizes**: Display (48px), H2 (28px), H3 (24px), Body (16px)
- **Spacing**: 8px base grid system

### Motion
- **Duration**: 250ms default
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero3D.tsx       # WebGL hero element
│   ├── UploadCard.tsx   # File upload with dropzone
│   ├── HeatmapViewer.tsx # Interactive heatmap overlay
│   ├── ResultSummaryCard.tsx
│   └── CalibrationModal.tsx
├── pages/               # Route components
│   ├── HomePage.tsx
│   ├── AnalyzePage.tsx
│   ├── ResultsPage.tsx
│   ├── HistoryPage.tsx
│   ├── CalibrationPage.tsx
│   └── SettingsPage.tsx
├── lib/
│   └── api.ts           # API client with mock mode
├── styles/
│   └── tokens.ts        # Design tokens
├── types/
│   └── api.ts           # TypeScript interfaces
└── App.tsx              # Main app component
```

## 🔧 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The `dist/` folder contains the static files ready for deployment.

### Static Hosting
Deploy the `dist/` folder to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

## 🎯 Performance Optimizations

- **Lazy Loading**: 3D components loaded on-demand
- **Code Splitting**: Route-based chunks
- **Image Optimization**: WebP support with fallbacks
- **Caching**: Aggressive asset caching
- **Web Workers**: Heavy computations offloaded

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Blind Friendly**: High contrast ratios, alternative patterns
- **Focus Management**: Visible focus indicators

## 🧪 Testing

The project includes example tests for critical components:

```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests (if configured)
```

## 🔒 Security Considerations

- **API Keys**: Never commit API keys; use environment variables
- **CORS**: Configure CORS policies on your backend
- **CSP**: Implement Content Security Policy headers
- **Data Privacy**: Images processed client-side when possible

## 🐛 Troubleshooting

### 3D Elements Not Loading
- Check WebGL support in browser
- Enable hardware acceleration
- Use fallback mode: set `enable3DVisualization: false` in settings

### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on backend
- Ensure API key is valid (if required)

### Performance Issues
- Reduce image sizes before upload
- Disable 3D visualizations on low-power devices
- Enable GPU acceleration in browser settings

## 📖 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL**: Required for 3D features (graceful fallback available)
- **ES2020**: Native support or transpilation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See inline code comments
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions

---

**Built for security professionals by security professionals.**

*MorphDetect Frontend - Detect image morphing. Fast. Explainable. Human-reviewed.*