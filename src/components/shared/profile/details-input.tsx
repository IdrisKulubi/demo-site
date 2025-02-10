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
import { Heart, GraduationCap, Calendar, Phone } from "lucide-react";
import { genders, ageRange } from "@/lib/constants";
import { ProfileFormData } from "@/lib/actions/profile.actions";
import { Control } from "react-hook-form";
import { useEffect, useState } from "react";
import { parsePhoneNumber, isValidPhoneNumber, CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';
import {
  Select as PhoneSelect,
  SelectContent as PhoneSelectContent,
  SelectItem as PhoneSelectItem,
  SelectTrigger as PhoneSelectTrigger,
  SelectValue as PhoneSelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/constants/countries";

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
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("KE");
  const [phoneInput, setPhoneInput] = useState(values.phoneNumber || "");
  const [isValid, setIsValid] = useState(false);
  const [formattedNumber, setFormattedNumber] = useState("");

  // Initialize phone number format if there's an initial value
  useEffect(() => {
    if (values.phoneNumber && values.phoneNumber !== phoneInput) {
      setPhoneInput(values.phoneNumber);
    }
  }, [values.phoneNumber, phoneInput]);

  // Validate and format phone number
  useEffect(() => {
    try {
      if (!phoneInput) {
        setIsValid(false);
        setFormattedNumber("");
        return;
      }

      const phoneNumber = parsePhoneNumberWithError(phoneInput, selectedCountry);
      const valid = phoneNumber.isValid();
      
      setIsValid(valid);
      if (valid) {
        const formatted = phoneNumber.formatInternational();
        setFormattedNumber(formatted);
        // Only update the form value if the number is valid
        if (phoneNumber.format("E.164") !== values.phoneNumber) {
          onChange("phoneNumber", phoneNumber.format("E.164"));
        }
      } else {
        setFormattedNumber("");
      }
    } catch (error) {
      setIsValid(false);
      setFormattedNumber("");
    }
  }, [phoneInput, selectedCountry]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+\s()-]/g, "");
    setPhoneInput(value);
  };

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    // Don't clear the input when changing country, just revalidate with new country code
    if (phoneInput) {
      try {
        const phoneNumber = parsePhoneNumberWithError(phoneInput, country);
        if (phoneNumber.isValid()) {
          onChange("phoneNumber", phoneNumber.format("E.164"));
        }
      } catch (error) {
        // Invalid number for new country, clear the input
        setPhoneInput("");
        onChange("phoneNumber", "");
      }
    }
  };

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
            value={(values.yearOfStudy ?? "").toString()}
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
            value={values.age?.toString() || ""}
            onValueChange={(value) => onChange("age", parseInt(value) || 0)}
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
            <Phone className="w-4 h-4 text-pink-500" />
            Phone Number 📱
          </Label>
          <div className="flex gap-2">
            <PhoneSelect
              value={selectedCountry}
              onValueChange={(value) => handleCountryChange(value as CountryCode)}
            >
              <PhoneSelectTrigger className="w-[120px] bg-pink-50/50 dark:bg-pink-950/50 border-pink-200">
                <PhoneSelectValue placeholder="Country">
                  <span className="flex items-center gap-2">
                    <span>{countries.find(c => c.code === selectedCountry)?.flag}</span>
                    <span className="text-sm">{countries.find(c => c.code === selectedCountry)?.dialCode}</span>
                  </span>
                </PhoneSelectValue>
              </PhoneSelectTrigger>
              <PhoneSelectContent>
                {countries.map((country) => (
                  <PhoneSelectItem
                    key={country.code}
                    value={country.code}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6">{country.flag}</span>
                    <span className="text-sm">{country.dialCode}</span>
                  </PhoneSelectItem>
                ))}
              </PhoneSelectContent>
            </PhoneSelect>

            <div className="flex-1 relative">
              <Input
                value={phoneInput}
                onChange={handlePhoneChange}
                placeholder={`e.g., ${
                  selectedCountry === "KE" ? "0712 345 678" : "area code and number"
                }`}
                className={`bg-pink-50/50 dark:bg-pink-950/50 border-pink-200 ${
                  phoneInput && !isValid ? "border-red-500" : ""
                } ${isValid ? "border-green-500" : ""}`}
                type="tel"
              />
              {phoneInput && formattedNumber && (
                <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
                  {formattedNumber}
                </div>
              )}
            </div>
          </div>

          {errors?.phoneNumber && (
            <p className="text-sm text-red-500">{errors.phoneNumber}</p>
          )}
          
          {phoneInput && !isValid && !errors?.phoneNumber && (
            <p className="text-sm text-yellow-500">
              Please enter a valid phone number for {countries.find(c => c.code === selectedCountry)?.name}
              <span className="block text-xs text-muted-foreground mt-1">
                This will be used for matching purposes
              </span>
            </p>
          )}

          {isValid && (
            <p className="text-sm text-green-500">
              ✓ Valid phone number
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Let&apos;s find your perfect match bestie 💫
      </p>
    </motion.div>
  );
}
