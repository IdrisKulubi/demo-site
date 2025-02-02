import { NextResponse } from "next/server";
import { getProfile } from "@/lib/actions/profile.actions";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const { limited } = await rateLimit(session.user.id);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const profile = await getProfile();

    return NextResponse.json({
      hasProfile: !!profile,
      profileCompleted: Boolean(profile?.profileCompleted),
      exists: !!profile,
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
