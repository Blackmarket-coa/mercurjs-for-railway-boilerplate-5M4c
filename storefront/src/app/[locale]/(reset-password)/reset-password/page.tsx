import type { Metadata } from "next"
import { Card } from "@/components/atoms"
import { ResetPasswordForm } from "@/components/molecules/ResetPasswordForm"


export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password to regain access to your account.",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="container flex justify-center py-8">
      <Card className="w-full max-w-md">
        <ResetPasswordForm token={token} />
      </Card>
    </main>
  )
}
