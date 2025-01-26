"use client";

import { useState } from "react";
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
  updateProfileField,
  updateProfilePhoto,
  removePhoto,
  type ProfileFormData,
} from "@/lib/actions/profile.actions";

interface ProfileFormProps {
  initialData: ProfileFormData;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const handleFieldUpdate = async (
    field: keyof Omit<ProfileFormData, "profilePhoto">,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    try {
      const result = await updateProfileField(field, value);
      if (result.success) {
        toast({
          title: "Profile updated! ✨",
          description: `Your ${field} has been updated successfully!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong 😅",
          description: result.error,
        });
      }
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong 😅",
        description: "Failed to update profile. Please try again!",
      });
    }
  };

  const handlePhotoUpdate = async (photos: string[]) => {
    try {
      await handleFieldUpdate("photos", photos);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong with your photos 😅",
        description: "Failed to update photos. Please try again!",
      });
    }
  };

  const handleProfilePhotoUpdate = async (photoUrl: string) => {
    try {
      const result = await updateProfilePhoto(photoUrl);
      if (result.success) {
        toast({
          title: "Profile photo updated! ✨",
          description: "Looking good bestie! 💝",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to update profile photo 😅",
        description: "Please try again!",
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
        title: "Failed to remove photo 😅",
        description: "Please try again",
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Photos Section */}
        <Card
          className={`relative overflow-hidden transition-all ${
            activeSection === "photos"
              ? "ring-2 ring-pink-500 shadow-lg scale-[1.02]"
              : ""
          }`}
          onMouseEnter={() => setActiveSection("photos")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Your Best Pics 📸
            </CardTitle>
            <CardDescription>
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

        {/* Bio Section */}
        <Card
          className={`relative overflow-hidden transition-all ${
            activeSection === "bio"
              ? "ring-2 ring-pink-500 shadow-lg scale-[1.02]"
              : ""
          }`}
          onMouseEnter={() => setActiveSection("bio")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Your Story 💭
            </CardTitle>
            <CardDescription>Let your personality shine! ✨</CardDescription>
          </CardHeader>
          <CardContent>
            <BioInput
              value={form.watch("bio")}
              onChange={(value) => handleFieldUpdate("bio", value)}
            />
          </CardContent>
        </Card>

        {/* Interests Section */}
        <Card
          className={`relative overflow-hidden transition-all ${
            activeSection === "interests"
              ? "ring-2 ring-pink-500 shadow-lg scale-[1.02]"
              : ""
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

        {/* Details Section */}
        <Card
          className={`relative overflow-hidden transition-all ${
            activeSection === "details"
              ? "ring-2 ring-pink-500 shadow-lg scale-[1.02]"
              : ""
          }`}
          onMouseEnter={() => setActiveSection("details")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Your Details 📝
            </CardTitle>
            <CardDescription>Tell us more about you! ✨</CardDescription>
          </CardHeader>
          <CardContent>
            <DetailsInput
              values={{
                lookingFor: form.watch("lookingFor"),
                course: form.watch("course"),
                yearOfStudy: form.watch("yearOfStudy"),
                gender: form.watch("gender"),
                age: form.watch("age"),
              }}
              onChange={(field, value) => handleFieldUpdate(field, value)}
              errors={{
                lookingFor: form.formState.errors.lookingFor?.message,
                course: form.formState.errors.course?.message,
                yearOfStudy: form.formState.errors.yearOfStudy?.message,
                gender: form.formState.errors.gender?.message,
                age: form.formState.errors.age?.message,
              }}
            />
          </CardContent>
        </Card>

        {/* Socials Section */}
        <Card
          className={`relative overflow-hidden transition-all md:col-span-2 ${
            activeSection === "socials"
              ? "ring-2 ring-pink-500 shadow-lg scale-[1.02]"
              : ""
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
              onChange={(platform, value) => handleFieldUpdate(platform, value)}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
