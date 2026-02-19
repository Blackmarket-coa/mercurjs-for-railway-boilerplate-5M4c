import type { Metadata } from "next"
import ForgotPasswordClientPage from "./ForgotPasswordClientPage"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link to recover your account access.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientPage />
}
