// src/app/movies/[id]/page.tsx
// v3
"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star, Clock, Calendar, Lock, Plus, Check, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieGrid from "@/components/movies/MovieGrid";
import TrailerModal from "@/components/movies/TrailerModal";
import VideoPlayer from "@/components/movies/VideoPlayer";
import { useAuth } from "@/hooks/useAuth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const formatCast = (cast: any[]): string => {
  if (!Array.isArray(cast) || cast.length === 0) return "";
  return cast
    .slice(0, 3)
    .map((c) => (typeof c === "string" ? c : c?.name || ""))
    .filter(Boolean)
    .join(", ");
};

const formatDuration = (duration: any): string => {
  if (!duration) return "";
  if (typeof duration === "string" && duration.includes("h")) return duration;
  const mins = parseInt(duration, 10);
  if (isNaN(mins)) return String(duration);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatGenres = (genre: any): string => {
  if (!genre) return "";
  if (Array.isArray(genre)) return genre.join(" · ");
  return String(genre);
};

const getUrl = (field: any): string => {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.url) return field.url;
  return "";
};

const getTrailerUrl = (trailer: any): string => {
  if (!trailer) return "";
  if (typeof trailer === "string") return trailer;
  if (typeof trailer === "object") {
    if (trailer.url?.includes("embed")) return trailer.url;
    if (trailer.youtubeId) return `https://www.youtube.com/embed/${trailer.youtubeId}`;
    if (trailer.url?.includes("youtube.com/watch")) {
      try {
        const id = new URL(trailer.url).searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      } catch { return ""; }
    }
    return trailer.url || "";
  }
  return "";
};

const getVideoUrl = (video: any): string => {
  if (!video) return "";
  if (typeof video === "string") return video;
  if (typeof video === "object" && video.url) return video.url;
  return "";
};

export default function MovieDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isSubscribed, isLoggedIn, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();

  const [movie, setMovie]             = useState<any>(null);
  const [related, setRelated]         = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [videoOpen, setVideoOpen]     = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`${API}/movies/${id}`);
        if (!res.ok) { setIsLoading(false); return; }
        const data = await res.json();
        const m = data.data?.movie || data.data || data;

        // Debug log
        console.log('[MOVIE DEBUG] raw video field:', JSON.stringify(m?.video));
        console.log('[MOVIE DEBUG] computed videoUrl:', getVideoUrl(m?.video));

        setMovie(m);

        const category = m.category || m.genres?.[0] || "";
        if (category) {
          const relRes  = await fetch(`${API}/movies?category=${category}&limit=7`);
          const relData = await relRes.json();
          if (relRes.ok) {
            const all = relData.data?.movies || relData.data || [];
            setRelated(all.filter((r: any) => r._id !== m._id).slice(0, 6));
          }
        }
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-brand-gold animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!movie) return notFound();

  const posterUrl   = getUrl(movie.poster);
  const backdropUrl = getUrl(movie.backdrop) || getUrl(movie.backdropUrl) || posterUrl;
  const trailerUrl  = getTrailerUrl(movie.trailer) || getTrailerUrl(movie.trailerUrl) || "";
  const videoUrl    = getVideoUrl(movie.video) || getVideoUrl(movie.videoUrl) || "";
  const castText    = formatCast(movie.cast);
  const duration    = formatDuration(movie.duration);
  const genres      = formatGenres(movie.genres || movie.genre);
  const inWatchlist = isInWatchlist(movie._id);

  // canWatch: subscribed users OR free movies
  const canWatch = isSubscribed || !movie.isSubscriptionRequired;

  // Debug log
  console.log('[PAGE DEBUG] videoUrl:', videoUrl);
  console.log('[PAGE DEBUG] canWatch:', canWatch);
  console.log('[PAGE DEBUG] isSubscribed:', isSubscribed);
  console.log('[PAGE DEBUG] isSubscriptionRequired:', movie.isSubscriptionRequired);

  const handleWatchlist = () => {
    if (!isLoggedIn) return;
    if (inWatchlist) removeFromWatchlist(movie._id);
    else addToWatchlist(movie._id);
  };

  const toCardShape = (m: any) => ({
    id: m._id,
    title: m.title,
    poster: getUrl(m.poster),
    backdropUrl: getUrl(m.backdrop) || getUrl(m.backdropUrl) || getUrl(m.poster),
    trailerUrl: getTrailerUrl(m.trailer) || getTrailerUrl(m.trailerUrl) || "",
    videoUrl: getVideoUrl(m.video) || getVideoUrl(m.videoUrl) || "",
    category: m.category,
    rating: m.rating || 0,
    year: m.year,
    duration: formatDuration(m.duration),
    genre: formatGenres(m.genres || m.genre),
    director: m.director,
    cast: Array.isArray(m.cast)
      ? m.cast.map((c: any) => (typeof c === "string" ? c : c?.name || ""))
      : [],
    trending: m.isTrending || false,
    badge: m.badge || null,
  });

  const relatedMapped = related.map(toCardShape);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">

        {/* Backdrop */}
        <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
          {backdropUrl ? (
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              priority
              unoptimized
              className="object-cover object-top brightness-[0.28]"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-bg-tertiary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-bg-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/60 to-transparent" />
          <div className="absolute top-20 left-0 right-0 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">

            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border shadow-card bg-bg-elevated">
                {posterUrl && (
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="280px"
                  />
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="font-display text-[clamp(36px,5vw,68px)] leading-none tracking-wider uppercase text-text-primary mb-4">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold text-xs font-semibold rounded-full">
                  <Star className="w-3 h-3 fill-brand-gold" /> {movie.rating || "N/A"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border text-text-secondary text-xs font-medium rounded-full">
                  <Calendar className="w-3 h-3" /> {movie.year}
                </span>
                {duration && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border text-text-secondary text-xs font-medium rounded-full">
                    <Clock className="w-3 h-3" /> {duration}
                  </span>
                )}
                {genres && genres.split(" · ").map((g: string) => (
                  <span key={g} className="px-3 py-1.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-medium rounded-full">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-text-secondary text-base leading-relaxed mb-6 max-w-2xl">
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {movie.director && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-1">Director</p>
                    <p className="text-sm text-text-primary font-medium">{movie.director}</p>
                  </div>
                )}
                {castText && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-1">Cast</p>
                    <p className="text-sm text-text-primary font-medium">{castText}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                {trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="flex items-center gap-2 px-7 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-black" /> Watch Trailer
                  </button>
                )}

                {canWatch ? (
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="flex items-center gap-2 px-7 py-3.5 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-brand-red-dark active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch Full Movie
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-7 py-3.5 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark active:scale-95 transition-all"
                  >
                    ✦ Subscribe to Watch
                  </Link>
                )}

                {isLoggedIn && (
                  <button
                    onClick={handleWatchlist}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm border transition-all active:scale-95 ${
                      inWatchlist
                        ? "bg-brand-gold/15 border-brand-gold/40 text-brand-gold"
                        : "bg-bg-tertiary border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
                    }`}
                  >
                    {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {inWatchlist ? "In My List" : "Add to List"}
                  </button>
                )}
              </div>

              {/* Video area */}
              <div className="rounded-2xl overflow-hidden border border-border bg-bg-tertiary aspect-video relative">
                {canWatch ? (
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-[72px] h-[72px] rounded-full bg-brand-red/20 border-2 border-brand-red flex items-center justify-center group-hover:bg-brand-red transition-all">
                      <Play className="w-8 h-8 fill-brand-red group-hover:fill-white ml-1 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-text-secondary text-sm font-medium">Click to Watch Full Movie</p>
                      <p className="text-text-muted text-xs mt-1">HD · Dolby Audio</p>
                    </div>
                  </button>
                ) : (
                  <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 rounded-2xl">
                    <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-2xl tracking-wider mb-1">Full Movie Locked</h3>
                      <p className="text-text-muted text-sm max-w-xs">
                        Subscribe to unlock this and thousands of movies.
                      </p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center">
                      {trailerUrl && (
                        <button
                          onClick={() => setTrailerOpen(true)}
                          className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                        >
                          <Play className="w-4 h-4 fill-white" /> Watch Trailer
                        </button>
                      )}
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-7 py-3 bg-brand-gold text-black rounded-xl font-bold text-sm hover:bg-brand-gold-dark transition-all"
                      >
                        ✦ Subscribe Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Related */}
          {relatedMapped.length > 0 && (
            <div className="mt-16">
              <MovieGrid
                title={`More ${movie.category} Movies`}
                movies={relatedMapped as any}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerUrl={trailerUrl}
          title={movie.title}
        />
      )}

      {/* VideoPlayer — always mount when canWatch, even if videoUrl is empty */}
      {canWatch && (
        <VideoPlayer
          isOpen={videoOpen}
          onClose={() => setVideoOpen(false)}
          videoUrl={videoUrl}
          title={movie.title}
          poster={posterUrl}
        />
      )}
    </>
  );
}