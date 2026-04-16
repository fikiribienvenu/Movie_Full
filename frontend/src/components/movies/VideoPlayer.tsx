// src/components/movies/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Play / Pause ───────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  // ── Mute ───────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  // ── Fullscreen ─────────────────────────────────────────────
  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      v.requestFullscreen?.();
    }
  }, []);

  // ── Restart ────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === " ") { e.preventDefault(); togglePlay(); return; }
      if (e.key === "m") { toggleMute(); return; }
      if (e.key === "f") { handleFullscreen(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, togglePlay, toggleMute, handleFullscreen, onClose]);

  // ── Lock body scroll ───────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Open / close: start or stop video ─────────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isOpen) {
      // Always start muted so browser allows autoplay
      v.muted = true;
      setMuted(true);
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [isOpen]);

  // ── Controls hide timer ────────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  // ── Video event handlers ───────────────────────────────────
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.currentTime = (val / 100) * v.duration;
    setProgress(val);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const currentTime = (progress / 100) * duration;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black"
          onMouseMove={resetControlsTimer}
          onTouchStart={resetControlsTimer}
        >
          {/* ── Top bar ── */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent"
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

          {/* ── Video ── */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            className="w-full h-full object-contain"
            playsInline
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => { setPlaying(false); setShowControls(true); }}
          />

          {/* ── Click overlay: play/pause ── */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlay}
          >
            {/* Big pause/play icon in center */}
            <AnimatePresence>
              {!playing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 rounded-full bg-black/60 border-2 border-white/40 flex items-center justify-center">
                    <Play className="w-9 h-9 fill-white text-white ml-1" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Muted hint ── */}
          <AnimatePresence>
            {muted && playing && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white text-xs px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 pointer-events-none"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Playing muted — click 🔊 to unmute
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bottom controls ── */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-5 pb-6 pt-12"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/60 text-xs tabular-nums w-10">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={progress}
                    onChange={onSeek}
                    className="flex-1 h-1 cursor-pointer rounded-full appearance-none"
                    style={{
                      accentColor: "#facc15",
                      background: `linear-gradient(to right, #facc15 ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
                    }}
                  />
                  <span className="text-white/60 text-xs tabular-nums w-10 text-right">{formatTime(duration)}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    {playing
                      ? <Pause className="w-5 h-5 fill-white" />
                      : <Play className="w-5 h-5 fill-white" />
                    }
                  </button>

                  {/* Restart */}
                  <button onClick={handleRestart} className="text-white/60 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                      {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={muted ? 0 : volume}
                      onChange={onVolumeChange}
                      className="w-20 h-1 cursor-pointer"
                      style={{ accentColor: "#facc15" }}
                    />
                  </div>

                  <div className="flex-1" />

                  {/* Fullscreen */}
                  <button onClick={handleFullscreen} className="text-white/60 hover:text-white transition-colors">
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