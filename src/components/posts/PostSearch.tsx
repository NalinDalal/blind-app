"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PostSearchProps {
  initialQuery?: string;
  initialSort?: string;
}

export default function PostSearch({
  initialQuery = "",
  initialSort = "latest",
}: PostSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sort) params.set("sort", sort);
    router.push(`/?${params.toString()}`);
  };

  const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "top", label: "Top" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  return (
    <div className="sticky top-14 bg-void/80 backdrop-blur-xl z-30 py-4 px-4 border-b border-subtle">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={18} className="text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the void..."
            className="
              w-full h-11 pl-10 pr-10 rounded-xl
              bg-surface border border-default
              text-foreground placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent
              transition-all duration-200
            "
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`
            p-2.5 rounded-xl transition-all duration-200
            ${showFilters
              ? "bg-[rgb(var(--accent))] text-foreground glow-accent"
              : "bg-surface text-muted hover:text-foreground hover:bg-surface-elevated"
            }
          `}
        >
          <SlidersHorizontal size={20} />
        </button>
      </form>

      {showFilters && (
        <div className="mt-3 flex gap-2 animate-slide-up">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${sort === option.value
                  ? "bg-foreground text-[rgb(var(--background))]"
                  : "bg-surface text-muted hover:text-foreground hover:bg-surface-elevated"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
