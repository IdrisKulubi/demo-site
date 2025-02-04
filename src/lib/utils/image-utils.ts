type OptimizeImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
};

export async function optimizeImage(
  url: string,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = "webp",
  } = options;

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("Invalid image format");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const img = await createImage(blob);

    const { width, height } = calculateDimensions(img, maxWidth, maxHeight);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        `image/${format}`,
        quality / 100
      );
    });

    const formData = new FormData();
    formData.append("file", optimizedBlob, `optimized.${format}`);

    //  optimized image
    const uploadResponse = await fetch("/api/optimize-upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error || "Failed to upload optimized image");
    }

    const { url: optimizedUrl } = await uploadResponse.json();
    return optimizedUrl;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return url;
    URL.revokeObjectURL(url);
  }
}

// Helper functions
function createImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function calculateDimensions(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
) {
  let { width, height } = img;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

// Validation helper
export async function isValidImage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      return false;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(blob);
    });
  } catch {
    return false;
  }
}

export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
  }
) => {
  if (!url) return "";

  const { width = 800, quality = 80, format = "webp" } = options ?? {};

  if (url.includes(process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL!)) {
    return `${url}?width=${width}&quality=${quality}&format=${format}`;
  }

  return url;
};
