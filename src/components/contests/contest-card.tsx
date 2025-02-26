import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contest } from "@/db/schema";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { CalendarIcon, ChevronRightIcon } from "lucide-react";

interface ContestCardProps {
  contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
  const timeRemaining = formatDistance(new Date(contest.endDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <h3 className="text-xl font-semibold">{contest.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {contest.description}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>Ends {timeRemaining}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">
            {contest.type.replace("both", "photo & bio")} contest
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link href={`/contests/${contest.id}`}>
            View Details
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 