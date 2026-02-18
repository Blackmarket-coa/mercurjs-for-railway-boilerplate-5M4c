import type { Metadata } from "next"
import Link from "next/link"
import { phase1ModuleFlags } from "@/lib/feature-flags"

export const metadata: Metadata = {
  title: "Feature Matrix | Free Black Market",
  description: "Compare currently available and rollout capabilities across goods, services, and community programs.",
}

const matrix = [
  ["Multi-vendor storefront", "Available now", "Goods"],
  ["Stripe direct payouts", "Available now", "Goods"],
  ["Subscriptions", "Available now", "Community Programs"],
  ["CSA share management", "Available now", "Community Programs"],
  ["Event ticketing", "Available now", "Services"],
  ["Digital downloads", "Available now", "Goods"],
  ["Local pickup / delivery", "Available now", "Goods"],
  ["Vendor messaging", "Available now", "Services"],
  ["Impact tracking", "In rollout", "Community Programs"],
]


const phase1Rollout = [
  ["POS runtime module gate", phase1ModuleFlags.pos],
  ["Weight pricing runtime module gate", phase1ModuleFlags.weightPricing],
  ["Pick/pack runtime module gate", phase1ModuleFlags.pickPack],
  ["Invoicing runtime module gate", phase1ModuleFlags.invoicing],
  ["Channel sync runtime module gate", phase1ModuleFlags.channelSync],
] as const
export default function FeatureMatrixPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Feature Matrix</h1>
          <p className="text-slate-200 mt-3 max-w-3xl">Real capability proof mapped to Goods, Services, and Community Programs.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-event="feature_matrix_viewed">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4">Capability</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Category bucket</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map(([feature, status, bucket]) => (
                <tr key={feature} className="border-t">
                  <td className="p-4 font-medium">{feature}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === "Available now" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="p-4">{bucket}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Phase 1 module rollout guardrails</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {phase1Rollout.map(([label, enabled]) => (
              <li key={label} className="flex items-center justify-between gap-2">
                <span>{label}</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${enabled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {enabled ? "Enabled" : "Disabled"}
                </span>
              </li>
            ))}
          </ul>
        </div>


        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/sell" className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium">Go to vendor onboarding</Link>
          <Link href="/what-you-sell" className="px-4 py-2 rounded-lg border text-sm font-medium">See vendor type entry points</Link>
        </div>
      </section>
    </div>
  )
}
