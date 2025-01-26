import { ProfileForm } from "@/components/profile/profile-form";
import { getProfile, ProfileFormData } from "@/lib/actions/profile.actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const profile = await getProfile(session.user.id);

  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile ✨</h1>
          <p className="text-muted-foreground">
            Update your profile and find your perfect match 💝
          </p>
        </div>
        <ProfileForm initialData={profile as ProfileFormData} />
      </div>
    </div>
  );
}
