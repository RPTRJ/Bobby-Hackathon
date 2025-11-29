import React, { useRef, useEffect, useState } from 'react';
import { Camera, Activity, AlertCircle, ScanLine } from 'lucide-react';
import { MachineInfo, MachineStatus } from '../types';
import { analyzeMachineFrame } from '../services/geminiService';

interface LiveMonitorProps {
  machine: MachineInfo;
  onIssueDetected: (issueData: any, snapshot: string) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ machine, onIssueDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // Clock timer
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Camera Setup
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      clearInterval(timer);
      // Cleanup stream
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleManualScan = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Capture frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.6);

      try {
        const result = await analyzeMachineFrame(base64Image);
        if (result.hasIssue) {
          onIssueDetected(result, snapshotUrl);
        } else {
            // Force an issue for demo purposes if AI says clean
             onIssueDetected({
                description: "Simulated: Abnormal vibration detected in motor housing.",
                partsRequired: ["Mounting Bolts", "Damping Pads"],
                costSelf: 250,
                costOutsourced: 1200
             }, snapshotUrl);
        }
      } catch (error) {
        console.error("Analysis failed", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Video Feed */}
      {cameraError ? (
        <div className="flex items-center justify-center h-full text-red-500 gap-2">
          <AlertCircle /> {cameraError}
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Hidden Canvas for Screenshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">{machine.name}</h2>
            <p className="text-slate-300 font-mono text-sm">ID: {machine.id}</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-mono text-white font-bold">
              {currentTime.toLocaleTimeString([], { hour12: false })}
             </div>
             <div className="text-slate-400 text-sm font-mono">
               {currentTime.toLocaleDateString()}
             </div>
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <div className="absolute top-20 left-4 pointer-events-none">
         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest border ${
            machine.status === MachineStatus.RUNNING ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
            'bg-red-500/20 text-red-400 border-red-500/50'
         }`}>
           ● {machine.status}
         </span>
      </div>

      {/* Scanning Overlay Animation (Decorative) */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-cyan-500/10 z-10 animate-pulse pointer-events-none flex items-center justify-center">
             <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] absolute top-1/2 animate-[scan_2s_ease-in-out_infinite]" />
             <div className="bg-black/80 px-4 py-2 rounded text-cyan-400 font-mono">AI ANALYZING...</div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-auto">
        <button
          onClick={handleManualScan}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-red-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <ScanLine className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'SCANNING...' : 'DETECT ANOMALY'}
        </button>
      </div>
    </div>
  );
};