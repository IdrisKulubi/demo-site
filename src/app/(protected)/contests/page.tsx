import { getActiveContests } from "@/lib/actions/contest.actions";
import { ContestCard } from "@/components/contests/contest-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default async function ContestsPage() {
  const contests = await getActiveContests();
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Photo & Bio Contests</h1>
        <p className="text-muted-foreground">
          Showcase your creativity and win a spot in our Hall of Fame!
        </p>
      </div>
      
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Contests</TabsTrigger>
          <TabsTrigger value="my-entries">My Entries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-8">
          {contests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Active Contests</h3>
              <p className="text-muted-foreground">
                Check back soon for new contests!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-entries">
          <MyContestEntries />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-12" />
      
      <div className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold">Hall of Fame</h2>
        <p className="text-muted-foreground">
          Our contest winners showcase the best creativity in our community!
        </p>
      </div>
      
      <HallOfFamePreview />
    </div>
  );
}

// Client components need to be imported dynamically
import { Suspense } from "react";
import { HallOfFamePreview } from "@/components/contests/hall-of-fame-preview";
import { MyContestEntries } from "@/components/contests/my-contest-entries"; 