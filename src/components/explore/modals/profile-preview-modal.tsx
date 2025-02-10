import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Profile } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

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
        <DialogContent className="max-w-md bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/20">
          <DialogHeader>
            <DialogTitle className="text-center mb-4 text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200 font-bold">
              Profile Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Photos Gallery */}
            <div className="relative h-72 overflow-hidden rounded-xl ring-2 ring-purple-200 dark:ring-purple-800 shadow-lg">
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory h-full">
                {profile.photos?.map((photo, i) => (
                  <div
                    key={i}
                    className="relative flex-none w-full snap-center"
                  >
                    <Image
                      src={photo}
                      alt={`${profile.firstName}'s photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-black/50 text-white backdrop-blur-sm"
                      >
                        {i + 1}/{profile.photos?.length}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 px-1">
              <div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-muted-foreground font-medium">
                  {profile.course} • Year {profile.yearOfStudy}
                </p>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1 text-purple-600 dark:text-purple-300">
                    About
                  </h4>
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-purple-600 dark:text-purple-300">
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.map((interest, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800/50 transition-colors"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}
