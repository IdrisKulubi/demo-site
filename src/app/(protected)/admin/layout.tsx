import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // // Ensure only admins can access
  // if (session?.user.role !== "admin") {
  //   redirect("/no-access");
  // }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="p-4 md:p-8 max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  );
} 