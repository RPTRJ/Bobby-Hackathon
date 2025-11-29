import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Issue, IssueStatus } from '../types';

interface IssueCardProps {
  issue: Issue;
  showStartBtn?: boolean;
  onStartFix: (issueId: string) => void;
  onViewDetails: (issue: Issue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, showStartBtn = false, onStartFix, onViewDetails }) => (
  <div 
    className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3 hover:border-slate-500 transition-colors cursor-pointer group shadow-lg"
    onClick={() => !showStartBtn && onViewDetails(issue)}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-slate-400">#{issue.id.slice(0, 6)}</span>
      <span className="text-xs text-slate-500">{new Date(issue.detectedAt).toLocaleTimeString()}</span>
    </div>
    <p className="text-sm font-medium text-slate-200 mb-3 line-clamp-2">
      {issue.description}
    </p>
    
    {showStartBtn ? (
      <button 
        onClick={(e) => { e.stopPropagation(); onStartFix(issue.id); }}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        START FIX <ArrowRight size={14} />
      </button>
    ) : (
      <div className="flex items-center justify-between text-xs text-slate-400">
         <span>{issue.partsRequired.length} Parts</span>
         <span className="group-hover:text-cyan-400 transition-colors">View Details →</span>
      </div>
    )}
  </div>
);

interface MaintenanceBoardProps {
  issues: Issue[];
  onStartFix: (issueId: string) => void;
  onViewDetails: (issue: Issue) => void;
}

export const MaintenanceBoard: React.FC<MaintenanceBoardProps> = ({ issues, onStartFix, onViewDetails }) => {
  
  const unresolved = issues.filter(i => i.status === IssueStatus.UNRESOLVED);
  const inProgress = issues.filter(i => i.status === IssueStatus.IN_PROGRESS);
  const completed = issues.filter(i => i.status === IssueStatus.COMPLETED);

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {/* Column 1: Unresolved */}
      <div className="flex-1 min-w-[300px] flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <h3 className="font-bold text-slate-200">Unresolved</h3>
          <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">{unresolved.length}</span>
        </div>
        <div className="p-3 overflow-y-auto flex-1 scrollbar-thin">
          {unresolved.length === 0 && <div className="text-center text-slate-600 text-sm mt-10">No new issues</div>}
          {unresolved.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue} 
              showStartBtn={true} 
              onStartFix={onStartFix}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Column 2: In Progress */}
      <div className="flex-1 min-w-[300px] flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <h3 className="font-bold text-slate-200">In Progress</h3>
          <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">{inProgress.length}</span>
        </div>
        <div className="p-3 overflow-y-auto flex-1 scrollbar-thin">
           {inProgress.length === 0 && <div className="text-center text-slate-600 text-sm mt-10">No active repairs</div>}
           {inProgress.map(issue => (
             <IssueCard 
               key={issue.id} 
               issue={issue} 
               onStartFix={onStartFix}
               onViewDetails={onViewDetails}
             />
           ))}
        </div>
      </div>

      {/* Column 3: Completed */}
      <div className="flex-1 min-w-[300px] flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800/50">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className="font-bold text-slate-200">Completed</h3>
          <span className="ml-auto bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">{completed.length}</span>
        </div>
        <div className="p-3 overflow-y-auto flex-1 scrollbar-thin">
           {completed.length === 0 && <div className="text-center text-slate-600 text-sm mt-10">No history today</div>}
           {completed.map(issue => (
             <div key={issue.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-3 opacity-75 grayscale hover:grayscale-0 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500">#{issue.id.slice(0, 6)}</span>
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
                <p className="text-sm text-slate-400 line-through">{issue.description}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};