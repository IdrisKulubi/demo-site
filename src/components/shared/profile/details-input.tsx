/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, GraduationCap, Calendar } from "lucide-react";
import { genders, ageRange } from "@/lib/constants";
import { ProfileFormData } from "@/lib/actions/profile.actions";
import { Control } from "react-hook-form";

interface DetailsInputProps {
  values: {
    firstName: string;
    lastName: string;
    lookingFor: string;
    course: string;
    yearOfStudy: number;
    gender: string;
    age: number;
    phoneNumber?: string;
  };
  onChange: (
    field: keyof Omit<
      ProfileFormData,
      | "profilePhoto"
      | "photos"
      | "bio"
      | "interests"
      | "instagram"
      | "spotify"
      | "snapchat"
    >,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => void;
  errors?: {
    lookingFor?: string;
    course?: string;
    yearOfStudy?: string;
    gender?: string;
    age?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
  };
  children?: React.ReactNode;
  control: Control<ProfileFormData>;
}

export function DetailsInput({
  values,
  onChange,
  errors,
  children,
  control,
}: DetailsInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              First Name
            </Label>
            <Input
              value={values.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              placeholder="Your first name"
              className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200"
            />
            {errors?.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Last Name
            </Label>
            <Input
              value={values.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              placeholder="Your last name"
              className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200"
            />
            {errors?.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            What are you looking for? 💖
          </Label>
          <Select
            value={values.lookingFor}
            onValueChange={(value) => onChange("lookingFor", value)}
          >
            <SelectTrigger className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200">
              <SelectValue placeholder="Choose your vibe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friends">Just Friends 🤝</SelectItem>
              <SelectItem value="dating">Dating 💘</SelectItem>
              <SelectItem value="both">Open to Both 🌟</SelectItem>
            </SelectContent>
          </Select>
          {errors?.lookingFor && (
            <p className="text-sm text-red-500">{errors.lookingFor}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-pink-500" />
            What&apos;s your course? 📚
          </Label>
          <Input
            value={values.course}
            onChange={(e) => onChange("course", e.target.value)}
            placeholder="e.g., Computer Science"
            className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200"
          />
          {errors?.course && (
            <p className="text-sm text-red-500">{errors.course}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            Year of Study 🎓
          </Label>
          <Select
            value={values.yearOfStudy.toString()}
            onValueChange={(value) => onChange("yearOfStudy", parseInt(value))}
          >
            <SelectTrigger className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200">
              <SelectValue placeholder="Select your year" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  Year {year} {year === 1 ? "👶" : year === 5 ? "👑" : "✨"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.yearOfStudy && (
            <p className="text-sm text-red-500">{errors.yearOfStudy}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            What&apos;s your gender? 💫
          </Label>
          <Select
            value={values.gender}
            onValueChange={(value) => onChange("gender", value)}
          >
            <SelectTrigger className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200">
              <SelectValue placeholder="Choose your gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.gender && (
            <p className="text-sm text-red-500">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            How old are you? 🎂
          </Label>
          <Select
            value={values.age?.toString()}
            onValueChange={(value) => onChange("age", parseInt(value))}
          >
            <SelectTrigger className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200">
              <SelectValue placeholder="Select your age" />
            </SelectTrigger>
            <SelectContent>
              {ageRange.map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} {age === 18 ? "🌱" : age === 25 ? "✨" : "🎈"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.age && <p className="text-sm text-red-500">{errors.age}</p>}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500" />
            Phone Number (Optional) 📱
          </Label>
          <Input
            value={values.phoneNumber || ""}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            placeholder="e.g., +254 712 345 678"
            className="bg-pink-50/50 dark:bg-pink-950/50 border-pink-200"
          />
          {errors?.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Let&apos;s find your perfect match bestie 💫
      </p>
    </motion.div>
  );
}
