import { useState } from 'react';
import { Activity, Download, Send } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import axios from 'axios';

export default function Predictions({ modelResults }) {
  const [predictInputs, setPredictInputs] = useState({});
  const [selectedModelForPrediction, setSelectedModelForPrediction] = useState('');
  const [singlePredictionResult, setSinglePredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  if (!modelResults) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Activity className="animate-pulse mb-4 text-agri-300" size={48} />
        <p>Models have not been trained yet.</p>
      </div>
    );
  }

  const { results, best_model, sample_actual, sample_predictions, features } = modelResults;

  // Initialize selected model if not set
  if (!selectedModelForPrediction && best_model) {
    setSelectedModelForPrediction(best_model);
  }

  // Format data for comparison chart
  const comparisonData = Object.keys(results).map(model => ({
    name: model,
    RMSE: results[model].RMSE,
    MAE: results[model].MAE,
    R2: results[model].R2 * 100 // Scale R2 to be visible alongside others if needed, though usually plotted separately
  }));

  // Format data for prediction line chart
  const predictionData = sample_actual.map((actual, index) => {
    const dataPoint = { index: index + 1, Actual: actual };
    Object.keys(sample_predictions).forEach(model => {
      dataPoint[model] = sample_predictions[model][index];
    });
    return dataPoint;
  });

  const downloadCSV = () => {
    // Generate simple CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Index,Actual," + Object.keys(sample_predictions).join(",") + "\n";
    
    predictionData.forEach(row => {
      let rowData = [row.index, row.Actual];
      Object.keys(sample_predictions).forEach(model => {
        rowData.push(row[model]);
      });
      csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePredictInputChange = (feature, value) => {
    setPredictInputs(prev => ({ ...prev, [feature]: value }));
  };

  const handlePredictSingle = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict_single', {
        model_name: selectedModelForPrediction,
        features: predictInputs
      });
      setSinglePredictionResult(res.data.prediction);
    } catch (err) {
      console.error(err);
      alert('Prediction failed. Ensure all inputs are valid numbers.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-blue-500" /> Analytics & Predictions
        </h2>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors shadow-sm text-sm font-medium"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(results).map(model => (
          <div key={model} className={`glass-card p-6 ${model === best_model ? 'ring-2 ring-agri-500 shadow-md shadow-agri-500/20 relative' : ''}`}>
            {model === best_model && (
              <span className="absolute -top-3 -right-3 bg-agri-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Best
              </span>
            )}
            <h3 className="font-semibold text-lg mb-4">{model}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">R² Score</span>
                <span className="font-medium">{(results[model].R2).toFixed(4)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div className="bg-agri-500 h-1.5 rounded-full" style={{ width: `${Math.max(0, results[model].R2 * 100)}%` }}></div>
              </div>
              
              <div className="flex justify-between pt-2">
                <span className="text-gray-500 text-sm">RMSE</span>
                <span className="font-medium">{results[model].RMSE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">MAE</span>
                <span className="font-medium">{results[model].MAE.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Model Error Comparison</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="RMSE" fill="#8b5cf6" name="RMSE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MAE" fill="#f59e0b" name="MAE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Actual vs Predicted (Sample)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="index" />
                <YAxis />
                <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={3} dot={false} />
                {Object.keys(results).map((model, idx) => (
                  <Line 
                    key={model} 
                    type="monotone" 
                    dataKey={model} 
                    stroke={['#3b82f6', '#f59e0b', '#8b5cf6'][idx % 3]} 
                    strokeWidth={1} 
                    dot={false}
                    strokeDasharray={model === best_model ? "0" : "5 5"}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Manual Prediction Space */}
      {features && features.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-6">Make a Manual Prediction</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Model</label>
              <select 
                className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-agri-500"
                value={selectedModelForPrediction}
                onChange={(e) => setSelectedModelForPrediction(e.target.value)}
              >
                {Object.keys(results).map(model => (
                  <option key={model} value={model}>{model} {model === best_model ? '(Best)' : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handlePredictSingle}
                disabled={isPredicting}
                className="w-full bg-agri-600 hover:bg-agri-700 text-white p-2.5 rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPredicting ? "Predicting..." : <><Send size={18} /> Get Prediction</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div key={feature}>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 truncate" title={feature}>
                  {feature}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-2 outline-none focus:ring-2 focus:ring-agri-500 text-sm"
                  placeholder={`Enter ${feature}`}
                  value={predictInputs[feature] || ''}
                  onChange={(e) => handlePredictInputChange(feature, e.target.value)}
                />
              </div>
            ))}
          </div>
          
          {singlePredictionResult !== null && (
            <div className="mt-8 p-6 bg-agri-50 dark:bg-agri-900/20 border border-agri-200 dark:border-agri-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Predicted Target Value</p>
                <p className="text-3xl font-bold text-agri-700 dark:text-agri-400 mt-1">
                  {singlePredictionResult.toFixed(2)}
                </p>
              </div>
              <Activity className="text-agri-400/50" size={48} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
