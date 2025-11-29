import React, { useState } from 'react';
import { X, ShieldCheck, Wrench, FileText, CheckCircle, Clock, DollarSign, PenTool } from 'lucide-react';
import { Issue, MachineInfo } from '../types';
import { generateRepairGuide } from '../services/geminiService';

interface IssueModalProps {
  issue: Issue;
  machine: MachineInfo;
  onClose: () => void;
  onUpdateIssue: (updatedIssue: Issue) => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ issue, machine, onClose, onUpdateIssue }) => {
  const [view, setView] = useState<'OVERVIEW' | 'REPAIR_GUIDE'>('OVERVIEW');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [repairStep, setRepairStep] = useState(0);

  const isWarrantyActive = new Date() < new Date(machine.warrantyExpiration);

  const handleCallWarranty = () => {
    // Simulate booking a date 3 days from now
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    onUpdateIssue({
      ...issue,
      warrantyClaimDate: nextDate,
    });
  };

  const handleStartRepair = async () => {
    setLoadingGuide(true);
    try {
        const guide = await generateRepairGuide(issue.description, machine.model);
        onUpdateIssue({
            ...issue,
            repairGuide: guide
        });
        setView('REPAIR_GUIDE');
    } catch(e) {
        console.error(e);
    } finally {
        setLoadingGuide(false);
    }
  };

  const handleFinishJob = () => {
      onUpdateIssue({
          ...issue,
          status: 'COMPLETED' as any // Avoiding circular dependency for enum in simple props
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-850 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="text-amber-500" /> Maintenance Task
            </h3>
            <p className="text-slate-400 text-sm mt-1">Ref: {issue.id} • Machine: {machine.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          
          {/* Main Overview View */}
          {view === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Snapshot */}
              {issue.snapshotUrl && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-700 relative">
                    <img src={issue.snapshotUrl} alt="Issue detected" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-4">
                        <p className="text-white font-medium bg-red-600/80 px-2 py-1 rounded text-sm backdrop-blur-md">
                            Detected: {issue.description}
                        </p>
                    </div>
                </div>
              )}

              {/* Warranty Section */}
              <div className={`p-4 rounded-xl border ${isWarrantyActive ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <ShieldCheck className={isWarrantyActive ? "text-emerald-400" : "text-slate-500"} />
                    <div>
                      <h4 className="font-semibold text-white">Warranty Status</h4>
                      <p className="text-sm text-slate-400">
                        {isWarrantyActive 
                          ? `Active until ${new Date(machine.warrantyExpiration).toLocaleDateString()}` 
                          : "Expired"}
                      </p>
                    </div>
                  </div>
                  {isWarrantyActive && !issue.warrantyClaimDate && (
                    <button 
                      onClick={handleCallWarranty}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      Call Warranty Support
                    </button>
                  )}
                </div>
                {issue.warrantyClaimDate && (
                   <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 p-2 rounded">
                      <Clock size={14} /> Technician scheduled for: {new Date(issue.warrantyClaimDate).toLocaleDateString()}
                   </div>
                )}
              </div>

              {/* Parts & Cost Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                   <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                     <PenTool size={16} /> REQUIRED PARTS
                   </h4>
                   <ul className="space-y-2">
                     {issue.partsRequired.map((part, i) => (
                       <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div> {part}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                   <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                     <DollarSign size={16} /> COST ESTIMATION
                   </h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg">
                       <span className="text-sm text-slate-400">Self Repair</span>
                       <span className="font-mono text-green-400 font-bold">฿{issue.estimatedCostSelf.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-lg">
                       <span className="text-sm text-slate-400">Outsourced</span>
                       <span className="font-mono text-amber-400 font-bold">฿{issue.estimatedCostOutsourced.toLocaleString()}</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!issue.warrantyClaimDate && (
                 <div className="pt-4 border-t border-slate-800">
                    <button 
                        onClick={handleStartRepair}
                        disabled={loadingGuide}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex justify-center items-center gap-2"
                    >
                        {loadingGuide ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        ) : (
                            <>
                                <Wrench size={20} /> VIEW REPAIR GUIDE & START
                            </>
                        )}
                    </button>
                 </div>
              )}
            </div>
          )}

          {/* Repair Guide View */}
          {view === 'REPAIR_GUIDE' && issue.repairGuide && (
             <div className="space-y-6">
                 <div className="bg-slate-800 p-4 rounded-xl">
                    <h4 className="font-bold text-white mb-2">Tools Needed</h4>
                    <div className="flex flex-wrap gap-2">
                        {issue.repairGuide.tools.map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 border border-slate-600">{t}</span>
                        ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    {issue.repairGuide.steps.map((step, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setRepairStep(idx)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                repairStep === idx 
                                ? 'bg-cyan-900/20 border-cyan-500/50' 
                                : repairStep > idx 
                                    ? 'bg-slate-800/50 border-slate-800 opacity-50' 
                                    : 'bg-slate-800 border-slate-700'
                            }`}
                        >
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                     repairStep === idx ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className={`text-sm ${repairStep === idx ? 'text-white' : 'text-slate-400'}`}>
                                        {step}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>

                 <div className="pt-6 flex justify-end">
                    <button 
                        onClick={handleFinishJob}
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 flex items-center gap-2"
                    >
                        <CheckCircle /> COMPLETE JOB
                    </button>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};