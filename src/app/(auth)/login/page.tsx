import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to StrathSpace</h1>
          <p className="text-gray-500">Sign in with your university email</p>
        </div>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <Button className="w-full">
            Sign in with Google
          </Button>
        </form>
      </div>
    </div>
  )
} 