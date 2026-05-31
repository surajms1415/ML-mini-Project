import { useState } from 'react';
import axios from 'axios';
import { Settings, ArrowRight, Activity } from 'lucide-react';

export default function DataConfig({ datasetInfo, setPreprocessingInfo, onNext }) {
  const [targetCol, setTargetCol] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [featureCols, setFeatureCols] = useState([]);
  const [filterPotato, setFilterPotato] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!datasetInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Activity className="animate-pulse mb-4 text-agri-300" size={48} />
        <p>Please upload a dataset first.</p>
      </div>
    );
  }

  const columns = datasetInfo.columns || [];

  const handleProcess = async () => {
    if (!targetCol) {
      setError('Target column is required');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    const config = {
      target_col: targetCol,
      date_col: dateCol,
      feature_cols: featureCols,
      filter_potato: filterPotato
    };

    const formData = new FormData();
    formData.append('config', JSON.stringify(config));

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/preprocess`, formData);
      setPreprocessingInfo(res.data);
      onNext();
    } catch (err) {
      setError(err.response?.data?.detail || 'Preprocessing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeatureToggle = (col) => {
    if (featureCols.includes(col)) {
      setFeatureCols(featureCols.filter(c => c !== col));
    } else {
      setFeatureCols([...featureCols, col]);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-agri-600" /> Data Preprocessing Config
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Target & Date Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Column (e.g. Arrivals)</label>
              <select 
                value={targetCol} 
                onChange={e => setTargetCol(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-2 text-sm focus:ring-agri-500 focus:border-agri-500"
              >
                <option value="">Select Target...</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date Column (Optional)</label>
              <select 
                value={dateCol} 
                onChange={e => setDateCol(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-2 text-sm focus:ring-agri-500 focus:border-agri-500"
              >
                <option value="">Select Date...</option>
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">If selected, lag features will be generated.</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="filterPotato"
                checked={filterPotato}
                onChange={e => setFilterPotato(e.target.checked)}
                className="rounded text-agri-600 focus:ring-agri-500 h-4 w-4"
              />
              <label htmlFor="filterPotato" className="text-sm">Filter data where Commodity == 'Potato'</label>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Feature Selection</h3>
          <p className="text-sm text-gray-500 mb-3">Select columns to use as predictors:</p>
          
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {columns.filter(c => c !== targetCol && c !== dateCol).map(col => (
              <label key={col} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-dark-bg rounded">
                <input 
                  type="checkbox" 
                  checked={featureCols.includes(col)}
                  onChange={() => handleFeatureToggle(col)}
                  className="rounded text-agri-600 focus:ring-agri-500 h-4 w-4"
                />
                <span className="text-sm">{col}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-200 dark:border-dark-border">
        <div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
        <button 
          onClick={handleProcess}
          disabled={isProcessing}
          className="bg-agri-600 hover:bg-agri-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
        >
          {isProcessing ? "Processing Data..." : "Run Preprocessing & Next"} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
