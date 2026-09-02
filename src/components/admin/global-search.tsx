"use client";

import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchAll } from "@/lib/search";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => searchAll(query), [query]);

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden rounded border bg-background px-1.5 text-xs sm:inline">⌘K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Search customers, stores, orders..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
                value={query}
                onValueChange={setQuery}
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty>No results found.</Command.Empty>
              {results.map((r) => (
                <Command.Item
                  key={`${r.type}-${r.id}`}
                  value={r.title}
                  onSelect={() => {
                    router.push(r.href);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 aria-selected:bg-accent"
                >
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.type}</span>
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
