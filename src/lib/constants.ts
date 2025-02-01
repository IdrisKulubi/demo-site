import { Camera, Pencil, Sparkles, GraduationCap, Share2 } from "lucide-react";

export const steps = [
  {
    id: "photos",
    title: "Show Your Best Self 📸",
    description:
      "Add your cutest pics bestie! Show off that main character energy ✨",
    icon: Camera,
  },
  {
    id: "bio",
    title: "Tell Your Story 💭",
    description:
      "Let your personality shine! Share what makes you uniquely you 🦋",
    icon: Pencil,
  },
  {
    id: "interests",
    title: "Pick Your Vibes 🌟",
    description:
      "Choose at least 3 interests that match your energy! Help us find your perfect match ✨",
    icon: Sparkles,
  },
  {
    id: "details",
    title: "Share Your Details 📚",
    description:
      "Tell us a bit more about you - what you're looking for and what you study 🎓",
    icon: GraduationCap,
  },
  {
    id: "socials",
    title: "Connect Your Socials 🔗",
    description:
      "Add your social handles so your matches can find you everywhere! (totally optional) 💫",
    icon: Share2,
  },
];

export const interests = [
  "🎮 Gaming",
  "🎵 Music",
  "📚 Reading",

  "🎨 Art",
  "🏃‍♂️ Sports",
  "🎬 Movies",
  "✈️ Travel",
  "🍳 Cooking",
  "📸 Photography",
  "🎸 Playing Music",
  "🐕 Pets",
  "🌱 Nature",
  "💻 Tech",
  "🎭 Theatre",
  
  "🎪 Events",
    "🎲 Board Games",
];

export const genders = [
  { value: "male", label: "Male 👨" },
  { value: "female", label: "Female 👩" },
  { value: "non-binary", label: "Non-binary 🌈" },
  { value: "other", label: "Other 💫" },
] as const;

export const ageRange = Array.from({ length: 8 }, (_, i) => i + 18);

export type Profile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string[] | null;
  photos: string[] | null;
  course: string | null;
  yearOfStudy: number | null;
  profilePhoto: string | null;
  updatedAt: Date;
  role: "user" | "admin" | null;
  isVisible: boolean;
  lastActive: Date;
  isComplete: boolean;
  profileCompleted: boolean;
  lookingFor: string | null;
  snapchat: string | null;
  instagram: string | null;
  spotify: string | null;
  phoneNumber: string;
  isMatch?: boolean;
};
