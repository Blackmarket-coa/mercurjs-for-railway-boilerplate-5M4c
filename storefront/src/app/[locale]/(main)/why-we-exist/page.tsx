import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Why We Exist | Free Black Market",
  description: "Learn why Free Black Market takes 3%, how community governance works, and the market problems this infrastructure solves.",
}

export default function WhyWeExistPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="uppercase tracking-wide text-slate-300 text-sm font-semibold">Mission and governance</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Why We Exist</h1>
          <p className="text-lg text-slate-200 max-w-3xl">We built Free Black Market as a community commerce platform that aligns incentives with local producers and organizers.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-2">Why 3%</h2>
          <p className="text-sm text-gray-700">A flat coalition fee keeps costs understandable. Vendors keep 97% of each sale without surprise platform penalties.</p>
        </article>
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-2">Why community governance</h2>
          <p className="text-sm text-gray-700">Platform rules should be accountable to the people using the system. Governance is part of product design, not an afterthought.</p>
        </article>
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-2">What problem we solve</h2>
          <p className="text-sm text-gray-700">Most commerce tools optimize for platform extraction. We optimize for producer earnings, local resilience, and trust.</p>
        </article>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl border bg-green-50 border-green-200 p-6 flex flex-wrap items-center gap-3 justify-between">
          <p className="font-medium text-green-900">Ready to participate?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/sell" className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium" data-event="why_we_exist_cta_clicked">Join as a vendor</Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-green-300 text-green-900 text-sm font-medium">Contribute on GitHub</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
