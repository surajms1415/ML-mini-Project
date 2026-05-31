import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadDataset from './components/UploadDataset';
import DataConfig from './components/DataConfig';
import ModelTraining from './components/ModelTraining';
import Dashboard from './components/Dashboard';
import Predictions from './components/Predictions';
import { Sun, Moon } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [preprocessingInfo, setPreprocessingInfo] = useState(null);
  const [modelResults, setModelResults] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard datasetInfo={datasetInfo} modelResults={modelResults} />;
      case 'upload':
        return <UploadDataset setDatasetInfo={setDatasetInfo} onNext={() => setActiveTab('config')} />;
      case 'config':
        return <DataConfig datasetInfo={datasetInfo} setPreprocessingInfo={setPreprocessingInfo} onNext={() => setActiveTab('training')} />;
      case 'training':
        return <ModelTraining preprocessingInfo={preprocessingInfo} setModelResults={setModelResults} onNext={() => setActiveTab('predictions')} />;
      case 'predictions':
        return <Predictions modelResults={modelResults} />;
      default:
        return <Dashboard datasetInfo={datasetInfo} modelResults={modelResults} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-dark-border bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm z-10">
          <h1 className="text-xl font-semibold text-agri-700 dark:text-agri-400">
            Potato Mandi Analytics
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-dark-bg p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
