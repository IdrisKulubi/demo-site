"use server";

/**
 * Prefetches profile images for faster loading
 * 
 * This function takes an array of photo URLs and optimizes them for prefetching
 * by adding width, quality, and format parameters. It then uses the browser's
 * cache API to store these images for quick access.
 * 
 * @param photos Array of photo URLs to prefetch
 * @returns Promise that resolves when prefetching is complete
 */
export async function prefetchProfileImages(photos: string[]) {
  // Skip empty arrays
  if (!photos.length) return;
  
  // Ensure URLs have optimization parameters
  const urls = photos.map(photo => {
    // Only add parameters if they don't already exist
    if (photo.includes('?')) {
      return photo;
    }
    return `${photo}?width=500&quality=70&format=webp`;
  });

  try {
    if (typeof window !== "undefined") {
      const { precacheImages } = await import("@/lib/utils/image-cache-sw");
      await precacheImages(urls);
    }
  } catch (error) {
    console.error("Prefetch failed:", error);
  }
}

/**
 * Prefetches the next batch of profiles' images
 * 
 * This function is designed to work with the profile queue system,
 * prefetching images for multiple profiles at once.
 * 
 * @param profiles Array of profiles to prefetch images for
 * @returns Promise that resolves when prefetching is complete
 */
export async function prefetchProfileBatch(profiles: Array<{ 
  profilePhoto?: string | null; 
  photos?: string[] | null;
}>) {
  try {
    // Extract all photo URLs from the profiles
    const allPhotos = profiles.flatMap(profile => {
      return [
        profile.profilePhoto,
        ...(profile.photos || [])
      ].filter(Boolean) as string[];
    });
    
    // Prefetch all photos at once
    await prefetchProfileImages(allPhotos);
    
    return { success: true };
  } catch (error) {
    console.error("Failed to prefetch profile batch:", error);
    return { success: false, error };
  }
}
