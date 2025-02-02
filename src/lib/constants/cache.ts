// Cache duration in seconds
export const CACHE_DURATION = 14400; // 4 hours

// Cache keys
export const CACHE_KEYS = {
  PROFILE_PHOTO: (userId: string) => `profile:${userId}:photo`,
  PROFILE_PHOTOS: (userId: string) => `profile:${userId}:photos`,
  SWIPABLE_PROFILES: "swipable-profiles",
  PROFILE: (userId: string) => `profile:${userId}`,
  LIKED_PROFILES: (userId: string) => `liked:${userId}`,
  LIKED_BY_PROFILES: (userId: string) => `liked_by:${userId}`,
  MATCHES: (userId: string) => `matches:${userId}`,
  RATE_LIMIT: (userId: string) => `rate_limit:${userId}`,
} as const;

// Cache TTL values in seconds
export const CACHE_TTL = {
  PROFILE: 300, // 5 minutes
  SWIPES: 60, // 1 minute
  MATCHES: 120, // 2 minutes
  PHOTOS: 3600, // 1 hour
  RATE_LIMIT: 60, // 1 minute
} as const;

// Cache prefixes for better organization
export const CACHE_PREFIX = {
  PROFILE: "profile",
  SWIPE: "swipe",
  MATCH: "match",
  PHOTO: "photo",
  RATE_LIMIT: "rate_limit",
} as const;
