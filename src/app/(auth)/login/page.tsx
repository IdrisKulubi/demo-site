import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginCard } from "@/components/auth/login-card";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background flex items-center justify-center px-4">
      <LoginCard />
    </div>
  );
}
