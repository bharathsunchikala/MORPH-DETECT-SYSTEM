import  { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ResultsPage } from './pages/ResultsPage';
import type { FlaskAnalysisResult } from './types/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentResult, setCurrentResult] = useState<{
    result: FlaskAnalysisResult;
    originalImage: string;
  } | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAnalysisResult = (result: FlaskAnalysisResult, originalImage: string) => {
    setCurrentResult({ result, originalImage });
    setCurrentPage('results');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'analyze':
        return <AnalyzePage onResult={handleAnalysisResult} onNavigate={handleNavigate} />;
      case 'results':
        return (
          <ResultsPage
            result={currentResult?.result || null}
            originalImage={currentResult?.originalImage || ''}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      
      <main className="pt-20">
        <AnimatePresence mode="wait">
          {renderCurrentPage()}
        </AnimatePresence>
      </main>
      <footer className="text-center text-xs text-gray-400 mt-10 mb-4">
  Developed by <span className="font-semibold">Sunchikala Bharath</span>
</footer>
    </div>
  );
}

export default App;