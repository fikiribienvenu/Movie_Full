// src/components/movies/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
}

export default function VideoPlayer({ isOpen, onClose, videoUrl, title, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true); // start muted to allow autoplay
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      if (e.key === "m") toggleMute();
      if (e.key === "f") handleFullscreen();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, playing, muted]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Auto-play muted when opened (bypasses browser autoplay block)
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.muted = true;
      setMuted(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }
    }
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      setMuted(true);
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
    if (!newMuted) videoRef.current.volume = volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    videoRef.current.muted = val === 0;
    setMuted(val === 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
    setProgress(val);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current?.requestFullscreen?.();
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    if (playing) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
          onMouseMove={handleMouseMove}
        >
          {/* Top bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-5 py-4 z-10 flex items-center justify-between"
              >
                <p className="text-white font-semibold text-sm truncate max-w-xs">{title}</p>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video */}
          <div
            className="flex-1 flex items-center justify-center relative cursor-pointer"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              poster={poster}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => { setPlaying(false); setShowControls(true); }}
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="w-full h-full object-contain"
              playsInline
              muted
            />

            {/* Muted hint */}
            {muted && playing && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 pointer-events-none"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Playing muted — click 🔊 to unmute
              </motion.div>
            )}

            {/* Big play/pause indicator */}
            <AnimatePresence>
              {!playing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 rounded-full bg-black/60 border-2 border-white/40 flex items-center justify-center">
                    <Play className="w-9 h-9 fill-white text-white ml-1" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-5 pb-6 pt-16"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/60 text-xs tabular-nums min-w-[36px]">
                    {formatTime((progress / 100) * duration)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={progress}
                    onChange={handleSeek}
                    className="flex-1 h-1 cursor-pointer"
                    style={{
                      accentColor: "#facc15",
                      background: `linear-gradient(to right, #facc15 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                    }}
                  />
                  <span className="text-white/60 text-xs tabular-nums min-w-[36px] text-right">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Buttons row */}
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors">
                    {playing
                      ? <Pause className="w-5 h-5 fill-white" />
                      : <Play className="w-5 h-5 fill-white" />
                    }
                  </button>

                  <button onClick={handleRestart} className="text-white/70 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                      {muted || volume === 0
                        ? <VolumeX className="w-5 h-5" />
                        : <Volume2 className="w-5 h-5" />
                      }
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 cursor-pointer"
                      style={{ accentColor: "#facc15" }}
                    />
                  </div>

                  <div className="flex-1" />

                  <button onClick={handleFullscreen} className="text-white/70 hover:text-white transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}