
import React, { useState, useRef, useEffect } from 'react';
import MusicRunner from './components/MusicRunner';
import { AudioAnalyzer } from './services/audioAnalyzer';
import { AudioAnalysis } from './types';
import { Square, Upload, Mic, Waves, Sparkles, Droplets, X } from 'lucide-react';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<AudioAnalyzer>(new AudioAnalyzer());
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && audioRef.current) {
      if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();
      try {
        await startSession(audioRef.current);
      } catch (err) {
        console.error("Session fail", err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMicStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession(stream);
    } catch (err) {
      alert("Microphone access is required for real-time resonance.");
    }
  };

  const requestLandscape = async () => {
    if (!containerRef.current) return;

    try {
      // Request Fullscreen first (required by most browsers to lock orientation)
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      }

      // Try to lock orientation to landscape
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch((e: any) => {
          console.log("Orientation lock failed or not supported:", e);
        });
      }
    } catch (err) {
      console.warn("Immersive mode transition failed:", err);
    }
  };

  const exitImmersive = async () => {
    try {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        if ((document as any).webkitFullscreenElement) await (document as any).webkitExitFullscreen();
      }
      
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch (err) {
      console.warn("Failed to exit immersive mode:", err);
    }
  };

  const startSession = async (source: HTMLAudioElement | MediaStream) => {
    // Attempt immersive mode for mobile users
    await requestLandscape();

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(true);
    setAnalysis(null); 
    await analyzerRef.current.init(source);
    if (source instanceof HTMLAudioElement) source.play();
    const tick = () => {
      const result = analyzerRef.current.analyze();
      if (result) setAnalysis(result);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const stopSession = () => {
    exitImmersive();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setAnalysis(null);
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center selection:bg-sky-100 overflow-x-hidden bg-[#f8fafc]">
      
      {/* Dynamic Header - Hidden when playing on small screens */}
      <header className={`pt-10 pb-6 sm:pt-14 sm:pb-10 text-center transition-all duration-700 ${isPlaying ? 'h-0 py-0 opacity-0 overflow-hidden sm:h-auto sm:opacity-100' : 'h-auto opacity-100'}`}>
        <h1 className="text-4xl sm:text-5xl font-light text-slate-800 tracking-[0.4em] flex items-center justify-center gap-4">
          AQUA <span className="text-sky-500 font-extrabold italic drop-shadow-sm">BEAT</span>
        </h1>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="w-8 sm:w-12 h-[1px] bg-slate-200" />
          <Droplets size={14} className="text-sky-400" />
          <div className="w-8 sm:w-12 h-[1px] bg-slate-200" />
        </div>
      </header>

      <main className={`w-full flex flex-col items-center transition-all duration-700 ${isPlaying ? 'flex-1' : 'max-w-6xl p-4 sm:p-12'}`}>
        
        {/* Main Display Container - Full screen on mobile playback */}
        <div className={`transition-all duration-700 relative w-full 
          ${isPlaying 
            ? 'h-full sm:h-auto sm:aspect-[21/9] rounded-none sm:rounded-[64px] shadow-none sm:shadow-2xl' 
            : 'aspect-[16/9] sm:aspect-[21/9] rounded-[40px] sm:rounded-[64px] shadow-2xl p-2 sm:p-6'
          } bg-white/40 backdrop-blur-xl border border-white/80 overflow-hidden`}>
          
          <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-slate-50 shadow-inner">
             <MusicRunner analysis={analysis} active={isPlaying} />
             
             {!isPlaying && (
               <div className="absolute inset-0 bg-white/10 flex items-center justify-center backdrop-blur-[1px]">
                 <div className="flex items-center gap-3 text-sky-400 animate-pulse">
                    <Waves size={20} />
                    <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Ready to Resonate</span>
                 </div>
               </div>
             )}

             {/* Floating Controls Overlay - Only visible when playing */}
             {isPlaying && (
               <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-4 z-50">
                  <button 
                    onClick={stopSession}
                    className="p-3 sm:px-6 sm:py-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full sm:rounded-2xl border border-white/30 flex items-center gap-2 transition-all hover:scale-110 active:scale-95 group"
                    title="Stop Journey"
                  >
                    <Square size={14} fill="white" className="group-hover:fill-rose-400 transition-colors" />
                    <span className="hidden sm:inline text-[10px] tracking-[0.3em] font-bold uppercase">Evaporate</span>
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Setup Controls - Hidden when playing to save space */}
        <div className={`flex flex-col items-center gap-10 mt-12 transition-all duration-500 ${isPlaying ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <label className="group relative flex flex-col items-center gap-4 px-10 py-8 sm:px-16 sm:py-9 bg-white border border-slate-100 text-slate-500 rounded-[36px] sm:rounded-[42px] cursor-pointer hover:border-sky-300 hover:text-sky-600 hover:shadow-xl transition-all duration-500 active:scale-95">
              <Upload size={22} strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.2em] font-bold uppercase">Infuse Track</span>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
            
            <button onClick={handleMicStart} className="group flex flex-col items-center gap-4 px-10 py-8 sm:px-16 sm:py-9 bg-gradient-to-br from-sky-400 to-sky-600 text-white rounded-[36px] sm:rounded-[42px] hover:shadow-2xl transition-all duration-500 active:scale-95">
              <Mic size={22} strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.2em] font-bold uppercase">Stream Flow</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-slate-400 tracking-[0.3em] uppercase font-light bg-slate-100/80 px-6 py-2 rounded-full">
            <Sparkles size={12} className="text-amber-300" />
            Designed for Crystal Clarity
          </div>
        </div>

        {/* Feature Grid - Desktop only/Initial state only */}
        {!isPlaying && (
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-8 px-6 mt-16 w-full max-w-6xl">
            {[
              { l: 'REFRACTION', c: 'bg-sky-400', d: 'Crystal depth mapping driven by timbre' },
              { l: 'AURAL SKY', c: 'bg-indigo-400', d: 'Atmospheric gradients reacting to resonance' },
              { l: 'FLOW STATE', c: 'bg-cyan-400', d: 'Physics-based surfing synced with flow' },
              { l: 'LUMINESCE', c: 'bg-teal-400', d: 'Ethereal star-bursts reacting to clarity' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center glass-card p-8 rounded-[36px] border border-white/60 hover:-translate-y-2 transition-transform duration-500">
                <div className={`w-1.5 h-1.5 ${item.c} rounded-full mb-6 shadow-sm`} />
                <h4 className="text-[10px] font-bold text-slate-700 tracking-[0.3em] mb-4 uppercase">{item.l}</h4>
                <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-light">{item.d}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className={`mt-auto pb-8 transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
        <Waves size={24} className="text-sky-200 animate-pulse" />
      </footer>

      <audio ref={audioRef} className="hidden" crossOrigin="anonymous" />
    </div>
  );
};

export default App;
