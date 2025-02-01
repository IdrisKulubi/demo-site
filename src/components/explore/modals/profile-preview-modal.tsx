import { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { GraduationCap, Music, Instagram } from "lucide-react";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export function ProfilePreviewModal({
  isOpen,
  onClose,
  profile,
}: ProfilePreviewModalProps) {
  if (!profile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-left">
            {profile.firstName}&apos;s Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Gallery */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
            {profile.photos?.[0] && (
              <Image
                src={profile.photos[0]}
                alt={`${profile.firstName}'s profile`}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h2 className="text-2xl font-bold text-white">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-200">{profile.age}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.course && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <GraduationCap className="h-4 w-4" />
                  {profile.course}
                </div>
              )}
              {profile.yearOfStudy && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Year {profile.yearOfStudy}
                </div>
              )}
            </div>

            {profile.interests && profile.interests.length > 0 && (
              <div className="space-y-1">
                <h3 className="font-medium">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.map((interest) => (
                    <span
                      key={interest}
                      className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {profile.spotify && (
                <a
                  href={profile.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-600"
                >
                  <Music className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
