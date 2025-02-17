"use client";

import { useEffect, useState } from "react";
import { getMatches } from "@/lib/actions/explore.actions";
import { useInterval } from "@/hooks/use-interval";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {  MessageSquareHeart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  matchId: string;
  matchedAt: Date;
  user1Id: string;
  user2Id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  course: string;
  yearOfStudy: number;
}

// Add validation helper
const isProfileComplete = (match: Match) => {
  return (
    match.firstName?.trim() &&
    match.lastName?.trim() &&
    match.profilePhoto &&
    match.course?.trim() &&
    match.yearOfStudy
  );
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const result = await getMatches();
      if (result.error) {
        setError(result.error);
      } else {
        setMatches(result.matches as unknown as Match[]);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to fetch matches");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchMatches();
  }, []);

  // Refresh matches every 30 seconds
  useInterval(() => {
    fetchMatches();
  }, 30000);

  // Add deduplication and validation
  const validMatches = matches
    .filter(isProfileComplete)
    // Remove duplicates based on matchId
    .filter((match, index, self) => 
      index === self.findIndex((m) => m.matchId === match.matchId)
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">💫</div>
          <p className="text-muted-foreground">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon="😢"
          title="Oops! Something went wrong"
          description={error}
        />
      </div>
    );
  }

  if (validMatches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon="💘"
          title="No matches yet bestie"
          description="Keep swiping! Your perfect match is out there somewhere ✨"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Your Matches
        <span className="text-base font-normal text-muted-foreground ml-2">
          ✨ {validMatches.length} connections
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {validMatches.map((match) => (
          <div
            key={match.matchId}
            className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-pink-100 dark:border-pink-900/50"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 relative overflow-hidden">
                <Image
                  src={match.profilePhoto || "/default-avatar.png"}
                  alt={`${match.firstName} ${match.lastName}`}
                  width={64}
                  height={64}
                  className="object-cover absolute inset-0"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                />
                <Skeleton className="absolute inset-0 rounded-full bg-muted/30 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {match.firstName} {match.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {match.course} • Year {match.yearOfStudy}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Matched{" "}
                  {new Date(match.matchedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="default"
                size="lg"
                className={cn(
                  "w-full bg-gradient-to-r from-pink-500 to-rose-400",
                  "hover:from-pink-600 hover:to-rose-500",
                  "text-white font-medium",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                  "border border-pink-200 dark:border-pink-800",
                  "flex items-center justify-center gap-2"
                )}
                asChild
              >
                <a href={`/chat/${match.matchId}`}>
                  <MessageSquareHeart className="h-5 w-5 animate-pulse" />
                  <span>Start Chatting</span>
                </a>
              </Button>
            </div>
          </div>
        ))}

        {validMatches.length === 0 && !isLoading && (
          <div className="col-span-full">
            <EmptyState
              icon="💝"
              title="No Matches Yet"
              description="Keep swiping to find your perfect match!"
            />
          </div>
        )}
      </div>
    </div>
  );
}
