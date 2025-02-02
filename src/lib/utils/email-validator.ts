import  db  from "@/db/drizzle";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isAllowedEmail(email: string, userId: string) {
  // Always allow if it's a Strathmore email
  if (email.endsWith("@strathmore.edu")) {
    return false;
  }

  // Check if user has an existing profile (grandfathered in)
  try {
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    return existingProfile.length > 0;
  } catch (error) {
    console.error("Error checking profile:", error);
    return false;
  }
}
