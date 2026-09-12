"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchAll } from "@/lib/search";
import type { SearchResult } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let active = true;
    searchAll(trimmed)
      .then((items) => {
        if (active) {
          setResults(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
  };

  const visibleResults = query.trim() ? results : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-card"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search platform...</span>
        <kbd className="hidden rounded-md border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden border-border/60 p-0 shadow-[var(--shadow-lg)] sm:max-w-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center border-b border-border/60 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                placeholder="Search customers, stores, orders..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
                value={query}
                onValueChange={handleQueryChange}
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {loading ? "Searching..." : query.trim() ? "No data found." : "Type to search."}
              </Command.Empty>
              {visibleResults.map((r) => (
                <Command.Item
                  key={`${r.type}-${r.id}`}
                  value={r.title}
                  onSelect={() => {
                    router.push(r.href);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 aria-selected:bg-primary/10 aria-selected:text-primary"
                >
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
                    {r.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.subtitle}</p>
                  </div>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
