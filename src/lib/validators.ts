import { z } from "zod";

export const profileSchema = z.object({
  photos: z
    .array(z.string().url())
    .min(1, "Bestie, you need at least one photo to find your match 📸"),
  bio: z
    .string()
    .min(
      10,
      "Tell us a bit more about yourself At least 10 words to catch someone's eye ✨"
    ),
  interests: z
    .array(z.string())
    .min(3, "Pick at least 3 vibes that match your energy 🌟"),
  lookingFor: z.enum(["friends", "dating", "both"], {
    required_error: "Tell us what you're looking for 👀",
  }),
  course: z.string().min(1, "Don't be shy, tell us what you study 📚"),
  yearOfStudy: z.number().min(1).max(5, "Which year are you in? 🎓"),
  instagram: z.string().optional(),
  spotify: z.string().optional(),
  snapchat: z.string().optional(),
  gender: z.enum(["male", "female", "non-binary", "other"], {
    required_error: "Please select your gender 💫",
  }),
  age: z.number().min(18).max(25, {
    message: "Age must be between 18 and 25 🎂",
  }),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9\s-]+$/, "Please enter a valid phone number 📱")
    .optional(),
});
