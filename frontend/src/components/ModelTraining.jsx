import { useState } from 'react';
import axios from 'axios';
import { Brain, Cpu, Activity, Play } from 'lucide-react';

export default function ModelTraining({ preprocessingInfo, setModelResults, onNext }) {
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState('');
  const [trained, setTrained] = useState(false);

  if (!preprocessingInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Activity className="animate-pulse mb-4 text-agri-300" size={48} />
        <p>Please complete data preprocessing first.</p>
      </div>
    );
  }

  const handleTrain = async () => {
    setIsTraining(true);
    setError('');
    
    const getApiUrl = () => {
      const url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      return url.replace(/\/+$/, '');
    };

    try {
      const res = await axios.post(`${getApiUrl()}/train`);
      setModelResults(res.data);
      setTrained(true);
    } catch (err) {
      console.error("Train error:", err);
      const errorMsg = err.response?.data?.detail || err.message || 'Training failed';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Brain className="text-purple-500" /> Model Training Pipeline
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Cpu size={24} />
          </div>
          <h4 className="font-semibold text-lg">Linear Regression</h4>
          <p className="text-sm text-gray-500 mt-2">Baseline model for continuous prediction.</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Activity size={24} />
          </div>
          <h4 className="font-semibold text-lg">Random Forest</h4>
          <p className="text-sm text-gray-500 mt-2">Ensemble method to capture non-linear patterns.</p>
        </div>
        
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <Brain size={24} />
          </div>
          <h4 className="font-semibold text-lg">SVR</h4>
          <p className="text-sm text-gray-500 mt-2">Support Vector Regressor with RBF kernel.</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center flex flex-col items-center border-t-4 border-t-agri-500">
        <h3 className="text-xl font-medium mb-2">Ready for Training</h3>
        <p className="text-gray-500 mb-6 max-w-lg">
          The dataset has been preprocessed ({preprocessingInfo.processed_rows} rows). 
          5-fold Cross Validation will be applied during training to ensure robustness.
        </p>

        {isTraining ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-agri-600 rounded-full animate-spin mb-4"></div>
            <p className="text-agri-600 font-medium animate-pulse">Training Models... Please wait</p>
          </div>
        ) : trained ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-6 py-3 rounded-lg flex items-center gap-2 font-medium">
              Training Complete! Models are ready for analysis.
            </div>
            <button 
              onClick={onNext}
              className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2 mx-auto"
            >
              View Results & Analytics
            </button>
          </div>
        ) : (
          <button 
            onClick={handleTrain}
            className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md shadow-agri-500/20 transition-all flex items-center gap-2"
          >
            <Play fill="currentColor" size={18} /> Start Training Pipeline
          </button>
        )}
        
        {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
      </div>
    </div>
  );
}
