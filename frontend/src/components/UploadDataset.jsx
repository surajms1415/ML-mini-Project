import { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function UploadDataset({ setDatasetInfo, onNext }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDatasetInfo(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Dataset Upload</h2>
      
      <div className="glass-card p-8 text-center border-dashed border-2 border-agri-200 dark:border-agri-900/50 hover:border-agri-400 dark:hover:border-agri-600 transition-colors relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className="w-16 h-16 bg-agri-100 dark:bg-agri-900/30 rounded-full flex items-center justify-center">
            <Upload className="text-agri-600 dark:text-agri-400" size={32} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {file ? file.name : "Drag and drop your CSV dataset here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse from your computer
            </p>
          </div>
        </div>
      </div>

      {file && (
        <div className="mt-6 flex justify-end items-center gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-agri-600 dark:text-agri-400 flex items-center gap-1"><CheckCircle2 size={16}/> Upload successful</p>}
          
          {!success ? (
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-agri-600 hover:bg-agri-700 text-white px-6 py-2 rounded-lg font-medium shadow-md shadow-agri-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {isUploading ? "Uploading..." : "Upload & Analyze"}
            </button>
          ) : (
            <button 
              onClick={onNext}
              className="bg-dark-card dark:bg-white text-white dark:text-dark-bg hover:opacity-90 px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              Proceed to Preprocessing <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
