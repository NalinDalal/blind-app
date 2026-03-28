"use client";

import { Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

type UserItem = string;

export default function UserSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCallRef = useRef<number>(0);
  const debounceRef = useRef<number | null>(null);

  useAutoSearch(q, doSearch, debounceRef);

  async function doSearch(reset = true) {
    setError(null);

    const now = Date.now();
    if (now - lastCallRef.current < 1000) return;
    lastCallRef.current = now;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", q);
      if (!reset && nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/search?${params.toString()}`, {
        method: "GET",
      });

      if (res.status === 401) {
        setError("Authentication required. Please sign in.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json?.error || "Server error");
        setLoading(false);
        return;
      }

      const json = await res.json();
      const fetched: UserItem[] = json.users || [];
      if (reset) setResults(fetched);
      else setResults((prev) => [...prev, ...fetched]);
      setNextCursor(json.nextCursor ?? null);
    } catch (_err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search size={18} className="text-neutral-500" />
        </div>
        <input
          id="anon-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doSearch(true);
            }
          }}
          placeholder="Search"
          aria-label="Search anonName"
          className="
            w-full h-10 pl-10 pr-10 rounded-lg
            bg-neutral-100 dark:bg-neutral-800
            text-neutral-900 dark:text-white
            placeholder-neutral-500 dark:placeholder-neutral-400
            border-none focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all
          "
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setResults([]);
              setNextCursor(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <output aria-live="polite" className="mt-3 block">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {!error && loading && (
          <div className="flex items-center justify-center py-4">
            <Loader text="" />
          </div>
        )}
      </output>

      <ul className="mt-4 space-y-1" aria-live="polite">
        {results.length === 0 && !loading && q.trim().length > 0 && (
          <li className="text-sm text-neutral-500 text-center py-4">
            No users found
          </li>
        )}
        {results.map((anonName) => (
          <li
            key={anonName}
            className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {anonName.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {anonName}
            </span>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <div className="mt-4 text-center">
          <Button
            onClick={() => doSearch(false)}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}

function useAutoSearch(
  q: string,
  doSearch: (reset?: boolean) => void,
  debounceRef: React.MutableRefObject<number | null>,
) {
  useEffect(() => {
    if (!q || q.trim().length === 0) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const id = window.setTimeout(() => doSearch(true), 300);
    debounceRef.current = id;
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [q, doSearch, debounceRef]);
}
