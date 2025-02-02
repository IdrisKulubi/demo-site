"use server";

import { getRedisInstance } from "@/lib/redis";

export async function getCachedImageUrl(
  userId: string
): Promise<string | null> {
  try {
    const redis = await getRedisInstance();
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
    const redis = await getRedisInstance();
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
