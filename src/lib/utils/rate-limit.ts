import { getRedisInstance } from "@/lib/redis";

export async function rateLimit(userId: string, limit = 10, window = 60) {
  const redis = await getRedisInstance();
  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  return {
    limited: current > limit,
    remaining: Math.max(limit - current, 0),
  };
}
