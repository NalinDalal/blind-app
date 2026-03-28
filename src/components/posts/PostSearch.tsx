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
    { value: "top", label: "Top (All Time)" },
    { value: "week", label: "Top (This Week)" },
    { value: "month", label: "Top (This Month)" },
  ];

  return (
    <div className="sticky top-14 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 z-30 py-3">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={18} className="text-neutral-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="
              w-full h-10 pl-10 pr-10 rounded-lg
              bg-neutral-100 dark:bg-neutral-800
              text-neutral-900 dark:text-white
              placeholder-neutral-500
              border-none focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`
            p-2 rounded-lg transition-colors
            ${
              showFilters
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700"
            }
          `}
        >
          <SlidersHorizontal size={20} />
        </button>

        <button
          type="submit"
          className="px-4 h-10 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${
                  sort === option.value
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
