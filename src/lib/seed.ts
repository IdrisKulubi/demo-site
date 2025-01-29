import db from "@/db/drizzle";
import { users, profiles } from "@/db/schema";
import { femaleProfiles, maleProfiles } from "./seed-data";
import { v4 as uuidv4 } from "uuid";

async function main() {
  try {
    console.log("🌱 Starting seeding...");

    // First, create user accounts for each profile
    for (const profileData of [...femaleProfiles, ...maleProfiles]) {
      // Create a user first
      const [user] = await db
        .insert(users)
        .values({
          id: uuidv4(),
          name: profileData.firstName && profileData.lastName 
            ? `${profileData.firstName} ${profileData.lastName}`
            : '',
          email: profileData.firstName && profileData.lastName
            ? `${profileData.firstName.toLowerCase()}.${profileData.lastName.toLowerCase()}@strathmore.edu`
            : '',
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActive: new Date(),
          isOnline: false,
        })
        .returning();

      // Then create the profile
      await db.insert(profiles).values({
        id: uuidv4(),
        userId: user.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        age: profileData.age,
        gender: profileData.gender,
        course: profileData.course,
        yearOfStudy: profileData.yearOfStudy,
        interests: profileData.interests,
        photos: profileData.photos || [],
        instagram: "",
        isVisible: true,
        profileCompleted: true,
        isComplete: true,
        updatedAt: new Date(),
        lastActive: new Date(),
      });

      console.log(
        `✅ Created profile for ${profileData.firstName} ${profileData.lastName}`
      );
    }

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Execute the seed function
main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Cleanup if needed
    process.exit(0);
  });
