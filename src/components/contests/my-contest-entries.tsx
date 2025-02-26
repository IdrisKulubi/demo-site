"use client";

import { useEffect, useState } from "react";
import { getUserContestEntries } from "@/lib/actions/contest.actions";
import { ContestEntryCard } from "./contest-entry-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";

export function MyContestEntries() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await getUserContestEntries();
        setEntries(data);
      } catch (error) {
        console.error("Error loading entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8 text-pink-500" />
        </div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <ContestEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📝"
          title="No Entries Yet"
          description="You haven't submitted any contest entries yet. Choose a contest to get started!"
        />
      )}
    </div>
  );
} 