"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { deleteUploadThingFile } from "@/lib/actions/upload.actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { optimizeImage } from "@/lib/utils/image-utils";

interface ImageUploadProps {
  value?: string[];
  onChange: (value: string[]) => void;
  onRemove?: (photoUrl: string) => void;
  onProfilePhotoSelect?: (photoUrl: string) => void;
  maxFiles: number;
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  onProfilePhotoSelect,
  maxFiles = 6,
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);

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
      await deleteUploadThingFile(url);
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {Array.isArray(value) &&
            value.map((url, index) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="object-cover w-full h-full"
                  width={400}
                  height={400}
                  quality={80}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onProfilePhotoSelect && (
                    <button
                      onClick={() => onProfilePhotoSelect(url)}
                      className="text-white bg-pink-500/80 hover:bg-pink-500 p-2 rounded-full"
                    >
                      Set as Profile
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(url)}
                    className="text-white bg-red-500/80 hover:bg-red-500 p-2 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {value.length < maxFiles && (
          <UploadDropzone
            endpoint="imageUploader"
            className={cn(
              "ut-button:bg-pink-500 ut-button:hover:bg-pink-600",
              "ut-label:text-pink-500 ut-label:hover:text-pink-600"
            )}
            onClientUploadComplete={async (res) => {
              if (res) {
                setIsOptimizing(true);
                try {
                  // Process and validate each uploaded image
                  const validUrls = await Promise.all(
                    res.map(async (file) => {
                      const isValid = await validateImage(
                        new File(
                          [await fetch(file.url).then((r) => r.blob())],
                          file.name,
                          {
                            type: file.type,
                            lastModified: Date.now(),
                          }
                        )
                      );
                      if (!isValid) return null;

                      // Optimize image before saving
                      const optimized = await optimizeImage(file.url, {
                        maxWidth: 1200,
                        maxHeight: 1200,
                        quality: 80,
                        format: "webp",
                      });

                      return optimized;
                    })
                  );

                  // Filter out invalid/null URLs
                  const newUrls = validUrls.filter(Boolean) as string[];
                  if (newUrls.length > 0) {
                    onChange([...value, ...newUrls]);
                  }
                } catch (error) {
                  console.error("Error processing uploads:", error);
                  toast({
                    title: "Upload failed",
                    description: "Please try again",
                    variant: "destructive",
                  });
                } finally {
                  setIsOptimizing(false);
                }
              }
            }}
            onUploadError={(error: Error) => {
              toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
              });
            }}
          />
        )}
      </div>

      {isOptimizing && (
        <p className="text-sm text-muted-foreground">
          Optimizing your images for the best quality... ✨
        </p>
      )}

      <p className="text-sm text-muted-foreground mt-2">
        {value.length === 0 && "Time to show off your best angles bestie 📸✨"}
        {value.length === 1 &&
          "Looking good! Add more pics to boost your chances 🌟"}
        {value.length === 2 && "Now we're talking The more the merrier 💫"}
        {value.length >= 3 &&
          value.length < maxFiles &&
          "Slay! You're killing it 💅"}
        {value.length === maxFiles &&
          "Perfect! You're all set to find your match 💝"}
      </p>
    </div>
  );
}
