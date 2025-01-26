"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProfileFormData,
  updateProfile,
  getProfile,
} from "@/lib/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InterestSelector } from "@/components/shared/profile/interest-selector";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/validators";
import { ImageUpload } from "@/components/shared/profile/image-upload";
import { steps } from "@/lib/constants";
import { deleteUploadThingFile } from "@/lib/actions/upload.actions";
import { BioInput } from "@/components/shared/profile/bio-input";
import { SocialInput } from "@/components/shared/profile/social-input";
import { DetailsInput } from "@/components/shared/profile/details-input";
import { useSession } from "next-auth/react";

const canProceed = (step: number, formData: ProfileFormData) => {
  switch (step) {
    case 0: // Photos
      return formData.photos.length > 0;
    case 1: // Bio
      return formData.bio?.split(" ").length >= 10;
    case 2: // Interests
      return formData.interests.length >= 3;
    case 3: // Details
      return formData.lookingFor && formData.course && formData.yearOfStudy;
    case 4: // Social (optional)
      return true;
    default:
      return true;
  }
};

export default function ProfileSetup() {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      photos: [],
      interests: [],
      bio: "",
      lookingFor: undefined,
      course: "",
      yearOfStudy: 0,
      instagram: "",
      spotify: "",
      snapchat: "",
      gender: undefined,
      age: 0,
      profilePhoto: "",
    },
  });
  const { data: session } = useSession();

  useEffect(() => {
    async function checkProfile() {
      if (session?.user?.id) {
        const profile = await getProfile(session.user.id);
        // Redirect to profile page if profile exists AND is completed
        if (profile?.profileCompleted) {
          router.push("/profile");
          return;
        }
      }
    }

    checkProfile();
  }, [session, router]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast({
          title: "Profile updated bestie ✨",
          description: "Time to find your perfect match",
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push("/dashboard");
      } else {
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong 😅",
          description: result.error,
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong 😅",
        description: "Failed to update profile. Please try again!",
      });
    }
  };

  // Cleanup function for when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Cleanup uploaded images if form wasn't submitted
      const photos = form.getValues("photos");
      if (photos.length > 0) {
        photos.forEach(async (url) => {
          await deleteUploadThingFile(url);
        });
      }
    };
  }, []);

  const isFormValid = (formData: ProfileFormData) => {
    return (
      formData.photos.length > 0 &&
      formData.bio?.split(/\s+/).filter(Boolean).length >= 10 &&
      formData.interests.length >= 3 &&
      formData.lookingFor &&
      formData.course &&
      formData.yearOfStudy > 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-pink-950 dark:to-background p-6 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {steps[step].title}
          </h1>
          <p className="text-muted-foreground">{steps[step].description}</p>
        </div>

        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              className={`h-2 flex-1 rounded-full ${
                i <= step ? "bg-pink-500" : "bg-pink-100 dark:bg-pink-900"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step content here - conditionally render based on current step */}

          {step === 0 && (
            <div className="space-y-4">
              <ImageUpload
                value={form.watch("photos")}
                onChange={(urls) => form.setValue("photos", urls)}
                maxFiles={6}
              />
              {form.formState.errors.photos && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.photos.message}
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <BioInput
                value={form.watch("bio") || ""}
                onChange={(value) => form.setValue("bio", value)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <InterestSelector
                value={form.watch("interests")}
                onChange={(interests) => form.setValue("interests", interests)}
              />
              {form.formState.errors.interests && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.interests.message}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <DetailsInput
                values={{
                  lookingFor: form.watch("lookingFor") || "",
                  course: form.watch("course") || "",
                  yearOfStudy: form.watch("yearOfStudy") || 0,
                  gender: form.watch("gender") || "",
                  age: form.watch("age") || 0,
                }}
                onChange={(field, value) => form.setValue(field, value)}
                errors={{
                  lookingFor: form.formState.errors.lookingFor?.message,
                  course: form.formState.errors.course?.message,
                  yearOfStudy: form.formState.errors.yearOfStudy?.message,
                  gender: form.formState.errors.gender?.message,
                  age: form.formState.errors.age?.message,
                }}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <SocialInput
                values={{
                  instagram: form.watch("instagram"),
                  spotify: form.watch("spotify"),
                  snapchat: form.watch("snapchat"),
                }}
                onChange={(platform, value) => form.setValue(platform, value)}
              />
            </div>
          )}

          <div className="flex justify-between">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto"
                disabled={!canProceed(step, form.getValues())}
              >
                {!canProceed(step, form.getValues()) ? (
                  <>
                    {step === 0 && "Add at least one photo 📸"}
                    {step === 1 && "Write at least 10 words ✍️"}
                    {step === 2 && "Pick 3+ vibes 🌟"}
                    {step === 3 && "Fill in all the deets 📝"}
                    {step === 4 && "Optional - Add your socials 🌟"}
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <motion.div
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                <Button
                  type="submit"
                  className="ml-auto relative"
                  disabled={!isFormValid(form.getValues()) || isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Finding Your Match...
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Find Your Match 💝
                    </motion.span>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
