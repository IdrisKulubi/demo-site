"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Profile } from "@/db/schema";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function ChatHeader({ partner }: { partner?: Profile | null }) {



  return (
    <div className="flex items-center p-4 border-b">
      <Link
        href="/explore"
        className="mr-2 p-1 hover:bg-accent rounded-full transition-colors"
      >
        <ChevronLeft className="h-8 w-8" />
      </Link>
      <Avatar className="h-10 w-10">
        {partner?.profilePhoto ? (
          <AvatarImage src={partner.profilePhoto} />
        ) : (
          <Skeleton className="h-full w-full rounded-full" />
        )}
        <AvatarFallback>
          {partner?.firstName?.[0]}{partner?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="ml-3">
        <h2 className="font-semibold">
          {partner?.firstName} {partner?.lastName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {partner?.yearOfStudy} Year - {partner?.course}
        </p>
      </div>
    </div>
  );
} 