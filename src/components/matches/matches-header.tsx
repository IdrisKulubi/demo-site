import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MatchesHeader() {
  return (
    <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-background/50">
      <div className="container max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            StrathSpace
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {/* Recent matches - replace with real data */}
              {[1, 2, 3].map((i) => (
                <Avatar key={i} className="border-2 border-white">
                  <AvatarImage src={`/placeholder-${i}.jpg`} />
                  <AvatarFallback>M{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
              <Heart className="h-4 w-4 fill-current" />
              <span className="font-medium">3</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
