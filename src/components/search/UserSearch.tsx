"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

type UserItem = string; // only anonName is exposed to the client

export default function UserSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // throttle control: timestamp of last API call
  const lastCallRef = useRef<number>(0);
  // debounce timer
  const debounceRef = useRef<number | null>(null);

  // Attach auto-search hook
  useAutoSearch(q, doSearch, debounceRef);

  async function doSearch(reset = true) {
    setError(null);

    // throttle: prevent calls more often than 1s
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
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <label htmlFor="anon-search" className="sr-only">
          Search anonName
        </label>
        <input
          id="anon-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              doSearch(true);
            }
          }}
          placeholder="Search anon name"
          aria-label="Search anonName"
          className="border rounded px-2 py-1 flex-1"
        />

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setQ("");
            setResults([]);
            setNextCursor(null);
          }}
          aria-label="Clear search"
          title="Clear"
        >
          Clear
        </Button>

        <Button
          onClick={() => doSearch(true)}
          disabled={loading || q.trim().length === 0}
          size="sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div role="status" aria-live="polite" className="mt-2">
        {error && <div className="text-red-600">{error}</div>}
        {!error && loading && (
          <div className="flex items-center gap-2">
            <Loader text={"Searching..."} />
          </div>
        )}
      </div>

      <ul className="mt-4 space-y-2" aria-live="polite">
        {results.length === 0 && !loading && q.trim().length > 0 && (
          <li className="text-sm text-gray-500">No users found</li>
        )}
        {results.map((anonName) => (
          <li key={anonName} className="border rounded p-2">
            <div className="font-medium">{anonName}</div>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <div className="mt-4">
          <Button onClick={() => doSearch(false)} disabled={loading} size="sm">
            {loading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Debounce: trigger search automatically 300ms after user stops typing
// We use an effect so typing triggers an auto-search; the Search button still forces a call
function useAutoSearch(q: string, doSearch: (reset?: boolean) => void, debounceRef: React.MutableRefObject<number | null>) {
  useEffect(() => {
    if (!q || q.trim().length === 0) return;
    // clear existing timer
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    // set new timer
    const id = window.setTimeout(() => doSearch(true), 300);
    debounceRef.current = id;
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [q, doSearch, debounceRef]);
}
