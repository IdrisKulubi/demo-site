import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined')
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Cache duration in seconds (e.g., 1 hour)
export const CACHE_DURATION = 3600

// Helper function to cache profile picture URLs
export async function cacheProfilePicture(userId: string, url: string) {
  await redis.set(`profile:${userId}`, url, {
    ex: CACHE_DURATION,
  })
}

// Helper function to get cached profile picture URL
export async function getCachedProfilePicture(userId: string): Promise<string | null> {
  return redis.get(`profile:${userId}`)
}
