"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/shared/profile/image-upload";
import { BioInput } from "@/components/shared/profile/bio-input";
import { InterestSelector } from "@/components/shared/profile/interest-selector";
import { DetailsInput } from "@/components/shared/profile/details-input";
import { SocialInput } from "@/components/shared/profile/social-input";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import {
  updateProfilePhoto,
  removePhoto,
  type ProfileFormData,
  updateProfile,
} from "@/lib/actions/profile.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  initialData: ProfileFormData;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsChanged(true);
    });
    return () => subscription.unsubscribe();
  }, [form, form.watch]);

  const handleSubmit = async () => {
    if (!isChanged) return;

    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      const result = await updateProfile(formData);

      if (result.success) {
        setIsChanged(false);
        router.refresh();
        toast({
          title: "Profile updated! ✨",
          description: "Your changes have been saved successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update failed ☹️",
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update failed ☹️",
        description: "Something went wrong. Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldUpdate = async (
    field: keyof Omit<ProfileFormData, "profilePhoto">,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    try {
      form.setValue(field, value);
      setIsChanged(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error updating field ☹️",
        description: "Please try again",
      });
    }
  };

  const handlePhotoUpdate = async (photos: string[]) => {
    try {
      form.setValue("photos", photos);
      await handleFieldUpdate("photos", photos);
      router.refresh();
    } catch (error) {
      form.setValue("photos", form.getValues("photos"));
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong with your photos ☹️",
        description: "Failed to update photos. Please try again",
      });
    }
  };

  const handleProfilePhotoUpdate = async (photoUrl: string) => {
    try {
      form.setValue("profilePhoto", photoUrl);
      const result = await updateProfilePhoto(photoUrl);
      if (result.success) {
        router.refresh();
        toast({
          title: "Profile photo updated! ✨",
          description: "Looking good bestie 💝",
        });
      }
    } catch (error) {
      form.setValue("profilePhoto", form.getValues("profilePhoto"));
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to update profile photo ☹️",
        description: "Please try again",
      });
    }
  };

  const handlePhotoRemove = async (photoUrl: string) => {
    try {
      const result = await removePhoto(photoUrl);
      if (result.success) {
        toast({
          title: "Photo removed ✨",
          description: "Photo deleted successfully",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to remove photo ☹️",
        description: "Please try again",
      });
    }
  };

  return (
    <div className="space-y-12">
      {/* Love-themed header with floating hearts animation */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[0, 20, 40, 60, 80, 100].map((leftPosition) => (
              <div
                key={leftPosition}
                className="absolute text-pink-500/20 dark:text-pink-500/10 text-4xl animate-float"
                style={{
                  left: `${leftPosition}%`,
                  animationDelay: `${leftPosition * 0.2}s`,
                }}
              >
                💝
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-8 md:grid-cols-2 md:gap-12"
        layout
      >
        {/* Photos Section */}
        <motion.div layoutId="photos-section" className="md:col-span-2">
          <Card
            className={`relative overflow-hidden transition-all duration-300 ${
              activeSection === "photos"
                ? "ring-2 ring-pink-500 shadow-xl scale-[1.02] bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background"
                : "hover:shadow-lg hover:scale-[1.01] bg-white/50 dark:bg-background/50"
            }`}
            onMouseEnter={() => setActiveSection("photos")}
            onMouseLeave={() => setActiveSection(null)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-transparent dark:from-pink-950/20"
              animate={{
                opacity: activeSection === "photos" ? 1 : 0,
              }}
            />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <motion.div
                  animate={{
                    rotate: activeSection === "photos" ? 360 : 0,
                    scale: activeSection === "photos" ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles className="w-6 h-6 text-pink-500" />
                </motion.div>
                Your Best Pics 📸
              </CardTitle>
              <CardDescription className="text-base">
                Show off your main character energy! ✨
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={form.watch("photos")}
                onChange={handlePhotoUpdate}
                onRemove={handlePhotoRemove}
                onProfilePhotoSelect={handleProfilePhotoUpdate}
                maxFiles={6}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bio & Interests Side by Side */}
        <motion.div layoutId="bio-section">
          <Card
            className={`relative h-full overflow-hidden transition-all duration-300 ${
              activeSection === "bio"
                ? "ring-2 ring-pink-500 shadow-xl scale-[1.02] bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background"
                : "hover:shadow-lg hover:scale-[1.01] bg-white/50 dark:bg-background/50"
            }`}
            onMouseEnter={() => setActiveSection("bio")}
            onMouseLeave={() => setActiveSection(null)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your Story 💭
              </CardTitle>
              <CardDescription>Let your personality shine ✨</CardDescription>
            </CardHeader>
            <CardContent>
              <BioInput
                value={form.watch("bio")}
                onChange={(value) => handleFieldUpdate("bio", value)}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div layoutId="interests-section">
          <Card
            className={`relative h-full overflow-hidden transition-all duration-300 ${
              activeSection === "interests"
                ? "ring-2 ring-pink-500 shadow-xl scale-[1.02] bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background"
                : "hover:shadow-lg hover:scale-[1.01] bg-white/50 dark:bg-background/50"
            }`}
            onMouseEnter={() => setActiveSection("interests")}
            onMouseLeave={() => setActiveSection(null)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your Vibes 🌟
              </CardTitle>
              <CardDescription>What makes you unique? ✨</CardDescription>
            </CardHeader>
            <CardContent>
              <InterestSelector
                value={form.watch("interests")}
                onChange={(value) => handleFieldUpdate("interests", value)}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Section - Full Width */}
        <motion.div layoutId="details-section" className="md:col-span-2">
          <Card
            className={`relative overflow-hidden transition-all duration-300 ${
              activeSection === "details"
                ? "ring-2 ring-pink-500 shadow-xl scale-[1.02] bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background"
                : "hover:shadow-lg hover:scale-[1.01] bg-white/50 dark:bg-background/50"
            }`}
            onMouseEnter={() => setActiveSection("details")}
            onMouseLeave={() => setActiveSection(null)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your Details 📝
              </CardTitle>
              <CardDescription>Tell us more about you ✨</CardDescription>
            </CardHeader>
            <CardContent>
              <DetailsInput
                control={form.control}
                values={{
                  firstName: form.watch("firstName"),
                  lastName: form.watch("lastName"),
                  lookingFor: form.watch("lookingFor"),
                  course: form.watch("course"),
                  yearOfStudy: form.watch("yearOfStudy"),
                  gender: form.watch("gender"),
                  age: form.watch("age"),
                  phoneNumber: form.watch("phoneNumber"),
                }}
                onChange={(field, value) => handleFieldUpdate(field, value)}
                errors={{
                  lookingFor: form.formState.errors.lookingFor?.message,
                  course: form.formState.errors.course?.message,
                  yearOfStudy: form.formState.errors.yearOfStudy?.message,
                  gender: form.formState.errors.gender?.message,
                  age: form.formState.errors.age?.message,
                  phoneNumber: form.formState.errors.phoneNumber?.message,
                  firstName: form.formState.errors.firstName?.message,
                  lastName: form.formState.errors.lastName?.message,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Socials Section - Full Width */}
        <motion.div layoutId="socials-section" className="md:col-span-2">
          <Card
            className={`relative overflow-hidden transition-all duration-300 ${
              activeSection === "socials"
                ? "ring-2 ring-pink-500 shadow-xl scale-[1.02] bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background"
                : "hover:shadow-lg hover:scale-[1.01] bg-white/50 dark:bg-background/50"
            }`}
            onMouseEnter={() => setActiveSection("socials")}
            onMouseLeave={() => setActiveSection(null)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your Socials 📱
              </CardTitle>
              <CardDescription>
                Let&apos;s connect everywhere! (optional) ✨
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialInput
                values={{
                  instagram: form.watch("instagram"),
                  spotify: form.watch("spotify"),
                  snapchat: form.watch("snapchat"),
                }}
                onChange={(platform, value) =>
                  handleFieldUpdate(platform, value)
                }
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Love-themed footer decoration */}
      <motion.div
        className="relative h-12 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="absolute inset-x-0 flex justify-center gap-4">
          {["💖", "✨", "💝", "✨", "💖"].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Add update button at the bottom */}
      {isChanged && (
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !isChanged ||
            !form.watch("phoneNumber") ||
            !!form.formState.errors.phoneNumber ||
            !/^[0-9+\-\s()]+$/.test(form.watch("phoneNumber") || "") ||
            (form.watch("phoneNumber") || "").length < 10
          }
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      )}
    </div>
  );
}
