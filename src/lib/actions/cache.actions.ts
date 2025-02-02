"use server";

import { getRedisInstance } from "@/lib/redis";

const redis = await getRedisInstance();

export async function getCachedImageUrl(
  userId: string
): Promise<string | null> {
  try {
    const key = `profile:${userId}:photo`;
    const cached = await redis.get<string>(key);
    return cached || null;
  } catch (error) {
    console.error("Error getting cached image:", error);
    return null;
  }
}

export async function prefetchProfileImages(userId: string, photos: string[]) {
  try {
    const promises = photos.map(async (photo) => {
      const key = `profile:${userId}:photo:${photo}`;
      await redis.set(key, photo, { ex: 3600 }); // Cache for 1 hour
    });
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error prefetching images:", error);
    return false;
  }
}
