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
    return NextResponse.json({
      profileCompleted: !!profile?.profileCompleted,
    });
  } catch {
    // console.error("Error checking profile:");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}