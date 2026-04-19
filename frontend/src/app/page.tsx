// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/movies/HeroSection";
import MovieGrid from "@/components/movies/MovieGrid";
import CategoryFilter from "@/components/movies/CategoryFilter";
import { Category } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API}/movies`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setMovies(data.data.movies);
      } catch (err) {
        console.error("Failed to fetch movies", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filterByCategory = (movieList: any[]) =>
    activeCategory === "all"
      ? movieList
      : movieList.filter((m) => m.category === activeCategory);

  const trending = filterByCategory(movies.filter((m) => m.isTrending));
  const latest = filterByCategory([...movies].sort((a, b) => b.year - a.year).slice(0, 12));
  const topRated = filterByCategory([...movies].sort((a, b) => b.rating - a.rating).slice(0, 8));
  const featured = movies.find((m) => m.isFeatured) || movies[0];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-text-muted text-sm animate-pulse">Loading movies...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {featured && <HeroSection movie={featured} />}

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-2">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
          {trending.length > 0 && (
            <MovieGrid title="🔥 Trending Now" movies={trending} showSeeAll seeAllHref="/search" />
          )}
          {latest.length > 0 && (
            <MovieGrid title="🆕 Latest Releases" movies={latest} showSeeAll seeAllHref="/search" />
          )}
          {topRated.length > 0 && (
            <MovieGrid title="⭐ Top Rated" movies={topRated} showSeeAll seeAllHref="/search" />
          )}
          {trending.length === 0 && latest.length === 0 && topRated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-4xl mb-4">🎬</p>
              <h3 className="font-display text-2xl tracking-wider mb-2">No movies found</h3>
              <p className="text-text-muted text-sm">No movies in the {activeCategory} category yet.</p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-4 px-5 py-2.5 bg-brand-red text-white rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-all"
              >
                Show All Movies
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}