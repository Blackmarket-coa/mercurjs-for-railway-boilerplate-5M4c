import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Beyond Selling | Free Black Market",
  description: "How Free Black Market supports co-ops, gardens, shared kitchens, and local resource systems as community infrastructure.",
}

const modules = [
  {
    title: "Co-ops",
    body: "Coordinate member-led storefronts, shared inventory, and distributed fulfillment with transparent payouts.",
  },
  {
    title: "Community gardens",
    body: "Run CSA shares, volunteer schedules, and seasonal produce programs from one operational system.",
  },
  {
    title: "Shared kitchens",
    body: "Book stations, manage member access, and monetize underutilized kitchen infrastructure.",
  },
  {
    title: "Local resource systems",
    body: "Support rental libraries, cooperative services, and neighborhood programs with measurable impact reporting.",
  },
]

export default function BeyondSellingPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-r from-emerald-800 to-green-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase text-emerald-200 tracking-wide text-sm font-semibold">Community infrastructure narrative</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Beyond Selling: Build Community Economy</h1>
          <p className="text-lg text-emerald-100 max-w-3xl">This is infrastructure for local economic networks, not just storefront software.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-5">
        {modules.map((module) => (
          <article key={module.title} className="rounded-2xl border p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-2">{module.title}</h2>
            <p className="text-gray-700">{module.body}</p>
          </article>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border bg-slate-50 p-6">
          <h2 className="text-xl font-semibold mb-3">Pilot-style case examples</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>A neighborhood co-op bundles produce + prepared meals from multiple vendors into one weekly pickup.</li>
            <li>A shared kitchen network rents idle capacity to micro-brands and tracks utilization by station.</li>
            <li>A community garden program combines subscriptions, workshops, and sponsored boxes in one storefront.</li>
          </ul>
          <div className="mt-5 flex gap-3 flex-wrap">
            <Link href="/why-we-exist" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm">Read mission and governance</Link>
            <Link href="/sell" className="px-4 py-2 rounded-lg border text-sm">Join as a vendor</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
