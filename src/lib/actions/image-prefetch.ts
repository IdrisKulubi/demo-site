"use server";

export async function prefetchProfileImages(photos: string[]) {
  const urls = photos.map(
    (photo) => `${photo}?width=500&quality=70&format=webp`
  );

  try {
    if (typeof window !== "undefined") {
      const { precacheImages } = await import("@/lib/utils/image-cache-sw");
      precacheImages(urls);
    }
  } catch (error) {
    console.error("Prefetch failed:", error);
  }
}
