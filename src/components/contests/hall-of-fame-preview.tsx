"use client";

import { Suspense } from "react";
import { HallOfFame } from "./hall-of-fame";
import { Skeleton } from "@/components/ui/skeleton";

export function HallOfFamePreview() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    }>
      <HallOfFame />
    </Suspense>
  );
} 