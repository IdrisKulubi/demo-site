"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAllUserPhotos } from "@/lib/actions/profile-update";

interface ImageReminderProps {
  userPhotos?: string[];
}

export function ImageReminder({ userPhotos }: ImageReminderProps) {
  const [showReminder, setShowReminder] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Show on homepage if there are old photos
    if (userPhotos?.length) {
      const hasOldPhotos = userPhotos.some(
        (photo) =>
          photo.includes("utfs.io") ||
          photo.includes("uploadthing") ||
          !photo.includes("pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev") ||
          !photo.includes("cdn.strathspace.com")
      );

      setShowReminder(hasOldPhotos);
    }
  }, [userPhotos]);

  const handleUpdatePhotos = async () => {
    if (!userPhotos?.length) return;

    setIsDeleting(true);
    try {
      const result = await deleteAllUserPhotos();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Photos cleared! 🎉",
        description: "Now let's upload your photos to our new storage system!",
      });

      // Redirect to profile setup and trigger image upload
      router.push("/profile?upload=true");
    } catch (error) {
      console.error("Error handling photo update:", error);
      toast({
        title: "Something went wrong",
        description:
          "Please try again or contact support if the issue persists",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!showReminder) return null;

  return (
    <AlertDialog open={showReminder} onOpenChange={() => {}}>
      <AlertDialogContent className="max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                🎨
              </motion.span>
              Let&apos;s Make Your Profile Shine
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-pink-600 dark:text-pink-400 font-semibold"
              >
                You may have noticed some of your photos or profile photos
                aren&apos;t loading properly oe not showing at all - let&apos;s
                fix that
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span>
                  To make Strathspace the vibrant community we all love,
                  I&apos;ve upgraded the image system to give you:
                </span>
                <motion.ul className="list-disc pl-5 mt-2 space-y-1">
                  {[
                    "Instant loading speeds (no more waiting around 🏃‍♂️)",
                    "Consistent display across all devices 📱",
                    "High-quality image preservation ✨",
                    "Better profile visibility to potential matches 💫",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="hover:text-pink-500 transition-colors duration-200"
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="bg-pink-500/10 p-3 rounded-md mt-3 hover:bg-pink-500/20 transition-colors duration-300"
              >
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  Quick update process (takes just a minute ⚡):
                </span>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
                  {[
                    "We'll clear your current photos (safely!)",
                    "You'll be taken to the upload page",
                    "Re-upload your best shots for that perfect profile ✨",
                  ].map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="hover:text-pink-500 transition-colors duration-200"
                    >
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <AlertDialogAction
              onClick={handleUpdatePhotos}
              disabled={isDeleting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium 
                transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                hover:shadow-lg hover:shadow-pink-500/25"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🪄</span> Preparing your
                  gallery...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ✨
                  </motion.span>
                  Update My Photos Now
                </span>
              )}
            </AlertDialogAction>
          </motion.div>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
