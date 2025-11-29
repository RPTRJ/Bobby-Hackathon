import React, { useState } from 'react';
import { LayoutDashboard, Video, Settings, Activity } from 'lucide-react';
import { LiveMonitor } from './components/LiveMonitor';
import { MaintenanceBoard } from './components/MaintenanceBoard';
import { IssueModal } from './components/IssueModal';
import { MachineInfo, MachineStatus, Issue, IssueStatus } from './types';
import { v4 as uuidv4 } from 'uuid'; // Actually we will simulate uuid since no package provided

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_MACHINE: MachineInfo = {
  id: "M-2024-X1",
  name: "CNC Milling Unit 04",
  status: MachineStatus.RUNNING,
  model: "Titan X-500 Industrial Mill",
  warrantyExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'MAINTENANCE'>('LIVE');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleIssueDetected = (aiResult: any, snapshotUrl: string) => {
    const newIssue: Issue = {
      id: generateId(),
      machineId: MOCK_MACHINE.id,
      description: aiResult.description,
      detectedAt: new Date(),
      status: IssueStatus.UNRESOLVED,
      snapshotUrl: snapshotUrl,
      partsRequired: aiResult.partsRequired,
      estimatedCostSelf: aiResult.costSelf,
      estimatedCostOutsourced: aiResult.costOutsourced,
    };
    
    setIssues(prev => [newIssue, ...prev]);
    // Switch to maintenance view to show the new item
    // setTimeout(() => setActiveTab('MAINTENANCE'), 1000); 
  };

  const handleStartFix = (id: string) => {
    setIssues(prev => prev.map(i => 
      i.id === id ? { ...i, status: IssueStatus.IN_PROGRESS } : i
    ));
  };

  const handleUpdateIssue = (updated: Issue) => {
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSelectedIssue(updated); // Update the modal view as well
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl hidden lg:block tracking-tight text-white">SmartMaint</span>
        </div>

        <nav className="flex-1 mt-8 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('LIVE')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'LIVE' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video size={20} />
            <span className="hidden lg:block font-medium">Live Monitor</span>
          </button>

          <button 
             onClick={() => setActiveTab('MAINTENANCE')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'MAINTENANCE' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block font-medium">Maintenance</span>
            {issues.filter(i => i.status === IssueStatus.UNRESOLVED).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden lg:block">
                {issues.filter(i => i.status === IssueStatus.UNRESOLVED).length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl hidden lg:block">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Connected Machine</p>
            <p className="text-sm font-medium text-white truncate">{MOCK_MACHINE.name}</p>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span className="text-xs text-green-400">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-8">
           <h1 className="text-xl font-bold text-white">
             {activeTab === 'LIVE' ? 'Live Machine Feed' : 'Maintenance Operations Center'}
           </h1>
           <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 font-mono">{new Date().toDateString()}</span>
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
           </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'LIVE' && (
             <div className="h-full flex flex-col gap-6">
                <div className="flex-1 min-h-0">
                   <LiveMonitor machine={MOCK_MACHINE} onIssueDetected={handleIssueDetected} />
                </div>
                {/* Mini notification if issues exist */}
                {issues.length > 0 && (
                  <div 
                    onClick={() => setActiveTab('MAINTENANCE')}
                    className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/20 p-2 rounded-lg text-red-500">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{issues.length} Issues Detected</h4>
                        <p className="text-sm text-slate-400">Review in Maintenance Dashboard</p>
                      </div>
                    </div>
                    <ArrowRight className="text-slate-500" />
                  </div>
                )}
             </div>
          )}

          {activeTab === 'MAINTENANCE' && (
            <MaintenanceBoard 
              issues={issues} 
              onStartFix={handleStartFix} 
              onViewDetails={setSelectedIssue}
            />
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedIssue && (
        <IssueModal 
          issue={selectedIssue} 
          machine={MOCK_MACHINE}
          onClose={() => setSelectedIssue(null)} 
          onUpdateIssue={handleUpdateIssue}
        />
      )}
    </div>
  );
};

// Simple Arrow Component for internal use
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default App;