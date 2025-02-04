"use client";

import { X, UploadCloud, Loader2, User } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { deleteUploadThingFile } from "@/lib/actions/upload.actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getCloudflareUploadUrl } from "@/lib/actions/cloudflare-upload";
import { deleteR2File } from "@/lib/cloudflare-r2";
import { optimizeImageClient } from "@/lib/utils/client-image-utils";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string[];
  onChange: (value: string[]) => void;
  onRemove?: (photoUrl: string) => void;
  onProfilePhotoSelect?: (photoUrl: string) => void;
  maxFiles?: number;
}

// Use NEXT_PUBLIC_ prefix for client-side access

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  onProfilePhotoSelect,
  maxFiles = 6,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  // Validate image before upload
  const validateImage = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Check if image dimensions are valid
        if (img.width < 200 || img.height < 200) {
          toast({
            title: "Image too small",
            description:
              "Please upload an image that is at least 200x200 pixels",
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        // Check if image is not blank/corrupted
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        try {
          const imageData = ctx?.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          if (!imageData) {
            resolve(false);
            return;
          }

          // Check if image is not completely white/blank
          const isBlank = imageData.data.every((pixel, index) => {
            return index % 4 === 3 || pixel === 255;
          });

          if (isBlank) {
            toast({
              title: "Invalid image",
              description: "The image appears to be blank or corrupted",
              variant: "destructive",
            });
            resolve(false);
            return;
          }

          resolve(true);
        } catch (error) {
          console.error("Error validating image:", error);
          resolve(false);
        }
      };

      img.onerror = () => {
        toast({
          title: "Invalid image",
          description: "The file appears to be corrupted",
          variant: "destructive",
        });
        resolve(false);
      };
    });
  };

  const handleRemove = async (url: string) => {
    try {
      if (url.includes(process.env.CLOUDFLARE_R2_PUBLIC_URL!)) {
        await deleteR2File(url);
      } else {
        await deleteUploadThingFile(url);
      }
      onRemove?.(url);
    } catch (error) {
      console.error("Error removing Image", error);
      toast({
        title: "Error removing image",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (files: FileList) => {
    const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL?.replace(
      /^https?:\/\//,
      ""
    ).replace(/\/$/, "");

    if (!publicUrl) {
      toast({
        title: "Configuration Error",
        description: "Image upload is not properly configured",
        variant: "destructive",
      });
      return;
    }

    if (value.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} images`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newUploadProgress: { [key: string]: number } = {};

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileId = `${Date.now()}-${index}`;
        newUploadProgress[fileId] = 0;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Validate and optimize image
        const isValid = await validateImage(file);
        if (!isValid) throw new Error("Invalid image");
        setUploadProgress((prev) => ({ ...prev, [fileId]: 20 }));

        const optimizedBlob = await optimizeImageClient(file);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 40 }));

        // Get upload URL
        const { presignedUrl, fileName } = await getCloudflareUploadUrl();
        setUploadProgress((prev) => ({ ...prev, [fileId]: 60 }));

        // Upload to R2
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: optimizedBlob,
          headers: { "Content-Type": "image/webp" },
        });

        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        setUploadProgress((prev) => ({ ...prev, [fileId]: 80 }));

        // Construct the final URL correctly without the 'uploads/' segment
        const imageUrl = `https://${publicUrl}/${fileName}`;

        // Add a small delay to ensure R2 has processed the upload
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        return imageUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      onChange([...value, ...newUrls]);

      toast({
        title: "Success!",
        description: `${newUrls.length} ${
          newUrls.length === 1 ? "image" : "images"
        } uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Couldn't upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  // Add this function to handle image load errors
  const handleImageError = (url: string) => {
    console.error(`Failed to load image: ${url}`);
    toast({
      title: "Image load error",
      description: "Failed to load the uploaded image",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Area */}
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="image-upload"
          className={cn(
            "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer",
            isUploading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:bg-gray-50",
            "transition-all duration-200"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 mb-4 animate-spin text-gray-500" />
                <p className="text-sm text-gray-500">Uploading images...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or WEBP (MAX. {maxFiles} images)
                </p>
              </>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence>
          {value.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square group"
            >
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => handleImageError(url)}
                priority={index < 4} // Prioritize loading first 4 images
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 bg-black/50 group-hover:opacity-100 transition-opacity rounded-lg">
                <button
                  onClick={() => onProfilePhotoSelect?.(url)}
                  className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  title="Set as profile photo"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(url)}
                  className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        {Object.entries(uploadProgress).map(([fileId, progress]) => (
          <div key={fileId} className="w-full">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
