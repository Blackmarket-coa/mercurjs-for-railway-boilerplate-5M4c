import { Metadata } from "next"
import { WalletDashboard } from "@/components/sections/WalletDashboard"

export const metadata: Metadata = {
  title: "My Wallet | Farm Fresh Marketplace",
  description: "Manage your digital wallet, view transactions, and invest in local producers.",
}

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>
        <WalletDashboard />
      </div>
    </div>
  )
}
