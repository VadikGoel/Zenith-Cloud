import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Download, X } from 'lucide-react';

export default function VideoPlayer({ src, title, downloadUrl }: { src: string, title: string, downloadUrl?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [controlsVisible, setControlsVisible] = useState(true);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Only hide if playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  const togglePlay = (e?: any) => {
    if(e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
      setCurrentTime(formatTime(videoRef.current.currentTime));
    }
  };

  const scrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    if(videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      const updateDuration = () => setDuration(formatTime(v.duration));
      v.addEventListener('loadedmetadata', updateDuration);
      v.addEventListener('play', () => { setIsPlaying(true); resetControlsTimeout(); });
      v.addEventListener('pause', () => { setIsPlaying(false); setControlsVisible(true); });
      return () => {
        v.removeEventListener('loadedmetadata', updateDuration);
        v.removeEventListener('play', () => setIsPlaying(true));
        v.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, [src]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') { if(videoRef.current) videoRef.current.currentTime += 10; }
      if (e.code === 'ArrowLeft') { if(videoRef.current) videoRef.current.currentTime -= 10; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef} 
      onMouseMove={resetControlsTimeout}
      className={`relative group w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 ${!controlsVisible && isPlaying ? 'cursor-none' : 'cursor-default'}`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        onTimeUpdate={handleProgress}
        onClick={() => togglePlay()}
        playsInline
      />

      {/* Middle Play Button */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(59,130,246,0.5)] scale-100 hover:scale-110 transition-transform active:scale-90">
            <Play size={40} fill="currentColor" className="ml-2" />
          </div>
        </div>
      )}

      {/* Premium Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-500 flex flex-col justify-between p-8 pointer-events-none ${controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Header */}
        <div className="flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse"></div>
            <span className="font-black text-white uppercase tracking-widest text-xs italic">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {downloadUrl && (
              <button 
                onClick={(e) => { e.stopPropagation(); window.open(downloadUrl); }}
                className="p-3 bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group/dl"
                title="Download Block"
              >
                <Download size={18} className="text-gray-400 group-hover/dl:text-white" />
              </button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
              >
                <Settings size={18} className="text-gray-400" />
              </button>
              
              {showSettings && (
                <div className="absolute top-full right-0 mt-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 w-48 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto z-50">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Playback Speed</p>
                  <div className="space-y-2">
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <button 
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                      >
                        {speed === 1 ? 'Normal' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div></div>

        {/* Bottom Controls */}
        <div className="space-y-6 pointer-events-auto">
          {/* Progress Bar */}
          <div className="relative group/progress">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={scrub}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-600 hover:h-2 transition-all"
            />
            <div 
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full pointer-events-none shadow-[0_0_15px_#3b82f6]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-all active:scale-90">
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </button>
                <div className="flex items-center gap-2 text-[10px] font-black font-mono text-gray-400">
                  <span className="text-blue-500">{currentTime}</span>
                  <span className="opacity-30">/</span>
                  <span>{duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 group/volume">
                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); if(videoRef.current) videoRef.current.muted = !isMuted; }} className="text-gray-400 hover:text-white transition-all">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { 
                    const v = parseFloat(e.target.value);
                    setVolume(v); 
                    if(videoRef.current) {
                      videoRef.current.volume = v;
                      videoRef.current.muted = v === 0;
                      setIsMuted(v === 0);
                    }
                  }}
                  className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-500 appearance-none bg-white/10 h-1 rounded-full accent-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
