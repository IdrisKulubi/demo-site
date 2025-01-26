"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export function ProfileSection() {
  return (
    <Card className="overflow-hidden border-pink-100 dark:border-pink-900">
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <div className="relative aspect-[3/4]">
              <Image
                src="/placeholder-profile.jpg"
                alt="Profile photo"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">Sarah, 23</h2>
                <p className="text-white/90">Computer Science @ Stanford</p>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="text-pink-600" />
        <CarouselNext className="text-pink-600" />
      </Carousel>
    </Card>
  );
}
