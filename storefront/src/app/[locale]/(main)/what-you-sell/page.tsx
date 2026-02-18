import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "What Are You Selling? | Free Black Market",
  description:
    "Choose your community commerce model and review how it works, who it is for, and use cases across goods, services, subscriptions, events, rentals, and programs.",
}

const entries = [
  {
    id: "physical-goods",
    title: "Physical Goods",
    howItWorks: "Create listings, set inventory, and choose local pickup, delivery, or shipping. Orders flow into one dashboard with vendor-controlled fulfillment.",
    who: "Farmers, makers, kitchen brands, and producers selling tangible products.",
    example: "A neighborhood bakery sells weekly bread drops and same-day pickup windows.",
  },
  {
    id: "services",
    title: "Services",
    howItWorks: "Publish service offers, receive direct inquiries, and use messaging + order workflows to scope and deliver each engagement.",
    who: "Consultants, educators, creative providers, and local service professionals.",
    example: "A chef offers private meal prep sessions with custom add-ons.",
  },
  {
    id: "subscriptions-csa",
    title: "CSA / Subscriptions",
    howItWorks: "Set recurring products, fulfillment cadence, and subscriber capacity. Track recurring revenue and upcoming delivery cycles.",
    who: "Farms, gardens, co-ops, and food programs with recurring shares.",
    example: "A 16-week CSA share auto-bills every Friday and updates pickup rosters automatically.",
  },
  {
    id: "digital-products",
    title: "Digital Products",
    howItWorks: "Upload digital assets and deliver secure downloads after checkout. Bundle files with physical products or subscriptions.",
    who: "Designers, educators, and creators selling templates, guides, and media.",
    example: "A herbalist sells printable seasonal wellness guides with instant access.",
  },
  {
    id: "event-tickets",
    title: "Event Tickets",
    howItWorks: "Launch event listings, set ticket quantities, and manage attendance updates with direct customer communication.",
    who: "Organizers, collectives, and educators hosting classes or community events.",
    example: "A cooperative hosts a monthly workshop series and caps each event at 40 attendees.",
  },
  {
    id: "rentals",
    title: "Rentals",
    howItWorks: "List rentable assets, set duration and availability, and coordinate handoff details through messaging.",
    who: "Shared kitchens, tool libraries, and community spaces monetizing underused assets.",
    example: "A shared kitchen rents stations by the hour and tracks equipment usage by booking.",
  },
  {
    id: "community-programs",
    title: "Community Programs",
    howItWorks: "Package mission programs as purchasable or sponsored offerings, then report outcomes using impact metrics.",
    who: "Mutual aid organizations, community gardens, and neighborhood initiatives.",
    example: "A food justice nonprofit runs sponsored produce boxes and reports household impact monthly.",
  },
]

export default function WhatYouSellPage() {
  return (
    <div className="bg-white">
      <section className="bg-green-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-wide text-green-300 text-sm font-semibold">Vendor entry points</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">What Are You Selling?</h1>
          <p className="text-lg text-green-100 max-w-3xl">Find the path that matches your business model and launch with the same 3% fee and 97% vendor payout.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry) => (
          <a key={entry.id} href={`#${entry.id}`} className="rounded-xl border p-4 hover:border-green-400 hover:bg-green-50 transition-colors">
            <p className="font-medium">{entry.title}</p>
            <p className="text-sm text-gray-600 mt-1">Tailored setup and workflow</p>
          </a>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {entries.map((entry) => (
          <article id={entry.id} key={entry.id} className="rounded-2xl border p-6 scroll-mt-24">
            <h2 className="text-2xl font-semibold mb-4">{entry.title}</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900 mb-1">How it works</p>
                <p className="text-gray-700">{entry.howItWorks}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Who this is for</p>
                <p className="text-gray-700">{entry.who}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Example use case</p>
                <p className="text-gray-700">{entry.example}</p>
              </div>
            </div>
          </article>
        ))}

        <div className="rounded-2xl border bg-green-50 border-green-200 p-6 flex flex-wrap justify-between items-center gap-4">
          <p className="font-medium text-green-900">Need a deeper capability checklist?</p>
          <Link href="/feature-matrix" className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium">View full feature matrix</Link>
        </div>
      </section>
    </div>
  )
}
