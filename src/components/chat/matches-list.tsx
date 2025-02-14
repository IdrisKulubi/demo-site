'use client';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getMatches } from '@/lib/actions/explore.actions';
import type { Profile } from '@/db/schema';

interface MatchesListProps {
  matches: Profile[];
  onSelectMatch?: (match: Profile) => void;
}

export function MatchesList({ matches: initialMatches, onSelectMatch }: MatchesListProps) {
  const [matches, setMatches] = useState<Profile[]>(initialMatches);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      const result = await getMatches();
      if (!result.error) {
        setMatches(result.matches as Profile[]);
      }
      setLoading(false);
    };
    loadMatches();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading matches...</div>;

  return (
    <div className="space-y-4 p-4">
      {matches.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No matches yet, keep swiping! 💘
        </div>
      ) : (
        matches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
            onClick={() => onSelectMatch?.(match)}
          >
            <div className="flex flex-1 items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={match.profilePhoto || ""} />
                <AvatarFallback>{match.firstName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{match.firstName} {match.lastName}</h3>
                <p className="text-sm text-muted-foreground">
                  {match.course} • Year {match.yearOfStudy}
                </p>
              </div>
              {match.unreadMessages && match.unreadMessages > 0 && (
                <Badge className="ml-auto">{match.unreadMessages}</Badge>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
} 