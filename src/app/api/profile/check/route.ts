import { NextResponse } from "next/server";
import { getProfile } from "@/lib/actions/profile.actions";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getProfile();

    // Be explicit about the response shape
    return NextResponse.json({
      profileCompleted: Boolean(profile?.profileCompleted),
      hasProfile: Boolean(profile),
    });
  } catch (error) {
    console.error("Error checking profile:", error);

    // Return a more specific error response
    return NextResponse.json(
      {
        error: "Failed to check profile status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
