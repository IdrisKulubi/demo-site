import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await db.query.users.findMany({
    with: { profile: true },
    orderBy: (users, { desc }) => [desc(users.createdAt)]
  });

  return NextResponse.json(data);
} 