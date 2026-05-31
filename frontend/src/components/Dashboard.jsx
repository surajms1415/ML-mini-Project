import { Database, TrendingUp, DollarSign, Award, Layers } from 'lucide-react';

export default function Dashboard({ datasetInfo, modelResults, setActiveTab }) {
  const isDataLoaded = !!datasetInfo;
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Overview Dashboard</h2>
          <p className="text-gray-500 mt-1">Potato Mandi Arrival Prediction System</p>
        </div>
        <div className="bg-agri-100 dark:bg-agri-900/40 text-agri-800 dark:text-agri-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-agri-500"></span>
          </span>
          System Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Records</p>
              <h3 className="text-2xl font-bold">{isDataLoaded ? datasetInfo.total_rows.toLocaleString() : '---'}</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
              <Database size={20} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Features Extracted</p>
              <h3 className="text-2xl font-bold">{isDataLoaded ? (datasetInfo.columns.length - 1) : '---'}</h3>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-lg">
              <Layers size={20} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Target Variable</p>
              <h3 className="text-lg font-bold truncate max-w-[120px]">Arrivals</h3>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-purple-500 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Award size={80} />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Best Model</p>
              <h3 className="text-xl font-bold">{modelResults ? modelResults.best_model : 'Not Trained'}</h3>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-lg">
              <Award size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
        {!isDataLoaded ? (
          <div className="max-w-2xl w-full">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Welcome to Potato Mandi Analytics</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              A comprehensive machine learning platform designed to predict and analyze potato arrivals across Indian mandis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
              <div className="bg-white/50 dark:bg-dark-card/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Database className="text-blue-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Data Preprocessing</h4>
                <p className="text-sm text-gray-500 mt-1">Automatic feature extraction, missing value handling, and time-series lagging.</p>
              </div>
              <div className="bg-white/50 dark:bg-dark-card/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Layers className="text-green-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Multiple ML Models</h4>
                <p className="text-sm text-gray-500 mt-1">Train Random Forest, SVR, and Linear Regression simultaneously.</p>
              </div>
              <div className="bg-white/50 dark:bg-dark-card/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Award className="text-purple-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Model Evaluation</h4>
                <p className="text-sm text-gray-500 mt-1">Compare models using RMSE, MAE, and R² scores to pick the best fit.</p>
              </div>
              <div className="bg-white/50 dark:bg-dark-card/50 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <TrendingUp className="text-orange-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Live Predictions</h4>
                <p className="text-sm text-gray-500 mt-1">Make new predictions instantly using the best-performing trained model.</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab && setActiveTab('upload')}
              className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-agri-500/30 transition-all hover:-translate-y-1 w-full md:w-auto"
            >
              Get Started (Upload or Demo Data)
            </button>
          </div>
        ) : !modelResults ? (
          <>
            <TrendingUp className="text-agri-300 dark:text-agri-600 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Data Loaded Successfully</h3>
            <p className="text-gray-500 max-w-md">Proceed to Data Preprocessing and Model Training from the sidebar to view insights.</p>
          </>
        ) : (
          <div className="w-full text-left">
            <h3 className="text-xl font-semibold mb-6">Project Objective Status</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                The machine learning models have been successfully trained on the dataset. The objective to predict potato mandi arrival volumes using ML regression techniques has been achieved.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                <strong>{modelResults.best_model}</strong> emerged as the best performing model with an R² score of <strong>{(modelResults.results[modelResults.best_model].R2).toFixed(4)}</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
