"use server";

import { getRedisInstance } from "@/lib/redis";

export async function setCachedData<T>(
  key: string,
  data: T,
  expirationSeconds = 60
): Promise<boolean> {
  try {
    const redis = await getRedisInstance();
    if (!redis) return false;

    // Ensure data is properly serialized, handling Date objects and undefined values
    const serializedData = JSON.stringify(data, (_, value) => {
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      return value;
    });

    await redis.set(key, serializedData, { ex: expirationSeconds });
    return true;
  } catch (error) {
    console.error("Error setting cache:", error);
    return false;
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const redis = await getRedisInstance();
    if (!redis) return null;

    const cached = await redis.get(key);
    if (!cached) return null;

    // Add validation for cached data format
    if (typeof cached !== "string") {
      await redis.del(key);
      return null;
    }

    // Safe parsing with validation
    const parsed = JSON.parse(cached, (_, value) => {
      if (value?.__type === "Date") {
        return new Date(value.value);
      }
      return value;
    });

    // Additional validation for parsed data structure
    if (!parsed || typeof parsed !== "object") {
      await redis.del(key);
      return null;
    }

    return parsed as T;
  } catch (error) {
    console.error("Error getting cache:", error);
    return null;
  }
}

// Helper to clear all cache for a user
export async function clearUserCache(userId: string) {
  try {
    const keys = [
      `swipable:${userId}`,
      `liked:${userId}`,
      `liked_by:${userId}`,
      `profile:${userId}`,
    ];

    const redis = await getRedisInstance();
    if (!redis) return false;

    await Promise.all(keys.map((key) => redis.del(key)));
    return true;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return false;
  }
}
