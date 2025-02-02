import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("UPSTASH_REDIS_REST_URL is not defined");
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("UPSTASH_REDIS_REST_TOKEN is not defined");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Increased cache duration for better performance (4 hours)
export const CACHE_DURATION = 14400;

// Cache keys
const KEYS = {
  PROFILE_PHOTO: (userId: string) => `profile:${userId}:photo`,
  PROFILE_PHOTOS: (userId: string) => `profile:${userId}:photos`,
  SWIPABLE_PROFILES: "swipable-profiles",
} as const;

// Enhanced caching with multi-level strategy
export async function cacheProfilePicture(userId: string, url: string) {
  await Promise.all([
    // Cache individual photo
    redis.set(KEYS.PROFILE_PHOTO(userId), url, { ex: CACHE_DURATION }),
    // Invalidate profile photos list
    redis.del(KEYS.PROFILE_PHOTOS(userId)),
  ]);
}

export async function cacheProfilePhotos(userId: string, photos: string[]) {
  await redis.set(KEYS.PROFILE_PHOTOS(userId), JSON.stringify(photos), {
    ex: CACHE_DURATION,
  });
}

export async function getCachedProfilePicture(
  userId: string
): Promise<string | null> {
  const [mainPhoto, photos] = await Promise.all([
    redis.get<string>(KEYS.PROFILE_PHOTO(userId)),
    redis.get<string>(KEYS.PROFILE_PHOTOS(userId)),
  ]);

  if (mainPhoto) return mainPhoto;
  if (photos) {
    const photosList = JSON.parse(photos);
    return photosList[0] || null;
  }
  return null;
}

// Batch cache operations for better performance
export async function batchCacheProfiles(
  profiles: Array<{ userId: string; photo: string }>
) {
  const pipeline = redis.pipeline();

  profiles.forEach(({ userId, photo }) => {
    pipeline.set(KEYS.PROFILE_PHOTO(userId), photo, { ex: CACHE_DURATION });
  });

  await pipeline.exec();
}
