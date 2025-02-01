import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

// Utility function to format phone number with country code
const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return "";

  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Add Kenya country code if not present
  if (digits.startsWith("0")) {
    return `254${digits.substring(1)}`;
  }

  // If number starts with 254, use as is
  if (digits.startsWith("254")) {
    return digits;
  }

  // If number starts with 7 or 1, add 254
  if (digits.startsWith("7") || digits.startsWith("1")) {
    return `254${digits}`;
  }

  return digits;
};

export function MatchCard({ profile }: { profile: Profile }) {
  const formattedPhoneNumber = formatPhoneNumber(profile.phoneNumber);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="group relative bg-white dark:bg-background rounded-xl p-3 shadow-sm border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
          <AvatarImage src={profile.profilePhoto || profile.photos?.[0]} />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            {profile.firstName?.[0]}
            {profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {profile.course} • Year {profile.yearOfStudy}
          </p>
        </div>
        <WhatsAppButton
          phoneNumber={formattedPhoneNumber}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          size="sm"
          variant="outline"
        />
      </div>
    </motion.div>
  );
}
