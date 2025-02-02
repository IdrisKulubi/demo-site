"use client";

import { useEffect, useState } from "react";
import { getMatches } from "@/lib/actions/explore.actions";
import { Profile } from "@/db/schema";
import { useInterval } from "@/hooks/use-interval";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Match extends Profile {
  matchId: string;
  matchedAt: Date;
}

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
        setMatches(result.matches as Match[]);
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

  if (matches.length === 0) {
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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">
        Your Matches
        <span className="text-base font-normal text-muted-foreground ml-2">
          ✨ {matches.length} connections
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <div
            key={match.matchId}
            className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
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
          </div>
        ))}
      </div>
    </div>
  );
}
