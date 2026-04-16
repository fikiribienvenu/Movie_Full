// src/components/movies/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  poster?: string;
}

export default function VideoPlayer({
  isOpen,
  onClose,
  videoUrl,
  title,
  poster,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // When opened, attempt muted autoplay after a short delay
  useEffect(() => {
    if (!isOpen) {
      setLoaded(false);
      return;
    }
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = true;
      v.play().catch(() => {
        // Autoplay blocked — video stays paused, user presses native play button
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black to-transparent absolute top-0 left-0 right-0 z-10">
            <p className="text-white font-semibold text-sm truncate max-w-xs">{title}</p>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Loading spinner until video is ready */}
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </div>
          )}

          {/* 
            Native controls — most reliable cross-browser solution.
            The browser's own play button will always work regardless
            of autoplay policies.
          */}
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            controls          // ← native controls: always works
            muted
            playsInline
            autoPlay
            className="w-full h-full object-contain"
            onCanPlay={() => setLoaded(true)}
            onLoadedMetadata={() => setLoaded(true)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}