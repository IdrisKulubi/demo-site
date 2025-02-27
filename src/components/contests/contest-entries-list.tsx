"use client";

import { useState, useEffect } from "react";
import { ContestEntryCard } from "./contest-entry-card";
import { getContestEntries } from "@/lib/actions/contest.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contest } from "@/db/schema";
import { pusherClient } from "@/lib/pusher/client";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";

interface ContestEntriesListProps {
  contest: Contest;
}

type SortOption = "popular" | "newest";
type FilterOption = "all" | "photo" | "bio";

export function ContestEntriesList({ contest }: ContestEntriesListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        const data = await getContestEntries(contest.id, sortBy);
        setEntries(data);
      } catch (error) {
        console.error("Error loading contest entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, [contest.id, sortBy]);

  useEffect(() => {
    // Subscribe to real-time vote updates
    const channel = pusherClient.subscribe(`contest-${contest.id}`);
    
    const handleVoteUpdate = (data: { entryId: string; voteCount: number; voterId: string }) => {
      setEntries(current => 
        current.map(entry => 
          entry.id === data.entryId 
            ? { 
                ...entry, 
                voteCount: data.voteCount,
                hasVoted: entry.hasVoted || entry.user.id === data.voterId
              } 
            : entry
        )
      );
    };
    
    channel.bind('vote-update', handleVoteUpdate);
    
    return () => {
      channel.unbind('vote-update', handleVoteUpdate);
      pusherClient.unsubscribe(`contest-${contest.id}`);
    };
  }, [contest.id]);

  // Filter entries based on type
  const filteredEntries = entries.filter(entry => 
    filterBy === "all" || entry.entryType === filterBy
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          defaultValue="all" 
          value={filterBy}
          onValueChange={(value) => setFilterBy(value as FilterOption)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Entries</TabsTrigger>
            <TabsTrigger value="photo" disabled={contest.type === "bio"}>Photos</TabsTrigger>
            <TabsTrigger value="bio" disabled={contest.type === "photo"}>Bios</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Voted</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8 text-pink-500" />
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <ContestEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏆"
          title="No entries yet"
          description="Be the first to submit an entry to this contest!"
        />
      )}
    </div>
  );
} 