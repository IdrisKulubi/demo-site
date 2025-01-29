/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { deleteUploadThingFile } from "@/lib/actions/upload.actions";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string[];
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

  const removeImage = async (urlToRemove: string) => {
    // First remove from UI for immediate feedback
    onChange(value.filter((url) => url !== urlToRemove));

    // Then delete from UploadThing
    const result = await deleteUploadThingFile(urlToRemove);
    if (!result.success) {
      console.error("Failed to delete image from storage");
    }
  };

  const handleUploadComplete = async (res: { url: string }[]) => {
    if (res) {
      const newUrls = res.map((file) => file.url);
      onChange([...value, ...newUrls]);
    }
  };

  const handleUploadError = async (error: Error) => {
    console.error(error);
    if (error.message.includes("FileSizeMismatch")) {
      toast({
        variant: "destructive",
        title: "File too large! 📏",
        description: "Please upload a file smaller than 8MB.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description:
          "An error occurred while uploading your file. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {value.map((url) => (
            <motion.div
              key={url}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <Image
                src={url}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {value.length < maxFiles && (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          className={cn(
            "ut-label:text-lg ut-label:text-muted-foreground",
            "ut-button:bg-pink-500 ut-button:hover:bg-pink-600",
            "ut-upload-icon:text-pink-500",
            "border-2 border-dashed border-pink-200 dark:border-pink-800",
            "hover:border-pink-300 dark:hover:border-pink-700",
            "ut-allowed-content:text-muted-foreground"
          )}
        />
      )}

      {/* Fun messages based on photo count */}
      <p className="text-sm text-muted-foreground mt-2">
        {value.length === 0 && "Time to show off your best angles bestie 📸✨"}
        {value.length === 1 &&
          "Looking good Add more pics to boost your chances🌟"}
        {value.length === 2 && "Now we're talking The more the merrier 💫"}
        {value.length >= 3 &&
          value.length < maxFiles &&
          "Slay You're killing it 💅"}
        {value.length === maxFiles &&
          "Perfect You're all set to find your match 💝"}
      </p>
    </div>
  );
}
