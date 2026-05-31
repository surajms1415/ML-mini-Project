import { LayoutDashboard, UploadCloud, Settings2, BrainCircuit, LineChart } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Dataset Upload', icon: UploadCloud },
    { id: 'config', label: 'Data Preprocessing', icon: Settings2 },
    { id: 'training', label: 'Model Training', icon: BrainCircuit },
    { id: 'predictions', label: 'Analytics & Predictions', icon: LineChart },
  ];

  return (
    <div className="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col h-full shadow-sm z-20 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-2 text-agri-600 dark:text-agri-400">
          <BrainCircuit size={28} />
          <span className="font-bold text-lg tracking-tight">AgriPredict AI</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium text-sm text-left",
                isActive 
                  ? "bg-agri-50 text-agri-700 dark:bg-agri-900/30 dark:text-agri-400 shadow-sm" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Icon size={20} className={isActive ? "text-agri-600 dark:text-agri-400" : "text-gray-400"} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        <div className="bg-agri-50 dark:bg-dark-bg rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-agri-800 dark:text-agri-300">Machine Learning Project</p>
          <p className="text-[10px] text-gray-500 mt-1">Potato Mandi Arrival Prediction v1.0</p>
        </div>
      </div>
    </div>
  );
}
