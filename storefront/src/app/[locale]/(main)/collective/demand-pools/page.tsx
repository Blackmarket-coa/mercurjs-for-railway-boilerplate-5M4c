import type { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { listDemandPools } from "@/lib/data/collective"

export const metadata: Metadata = {
  title: "Collective Demand Pools",
  description:
    "Join collective demand pools to aggregate buying power and unlock better supplier pricing.",
}

export default async function DemandPoolsPage() {
  const pools = await listDemandPools({ sort_by: "attractiveness", limit: 50 })

  return (
    <main className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Collective Demand Pools</h1>
          <p className="text-sm text-ui-fg-subtle">
            Browse open group-buy opportunities and commit your quantity.
          </p>
        </div>
        <LocalizedClientLink
          href="/collective/demand-pools/new"
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Create Demand Pool
        </LocalizedClientLink>
      </div>

      {pools.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-ui-fg-subtle">
          No open demand pools yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pools.map((pool) => {
            const progress = Math.min(
              100,
              Math.round((Number(pool.committed_quantity) / Number(pool.target_quantity || 1)) * 100)
            )

            return (
              <div key={pool.id} className="rounded-md border p-4">
                <div className="mb-1 text-xs uppercase text-ui-fg-subtle">
                  {pool.category || "General"} · {pool.status}
                </div>
                <h2 className="mb-2 text-lg font-medium">{pool.title}</h2>
                <p className="mb-3 line-clamp-3 text-sm text-ui-fg-subtle">{pool.description}</p>

                <div className="mb-1 text-xs text-ui-fg-subtle">
                  {pool.committed_quantity}/{pool.target_quantity} {pool.unit_of_measure || "units"} committed
                </div>
                <div className="h-2 w-full rounded bg-ui-bg-subtle">
                  <div className="h-2 rounded bg-primary" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-4">
                  <LocalizedClientLink
                    href={`/collective/demand-pools/${pool.id}`}
                    className="text-sm font-medium underline"
                  >
                    View details
                  </LocalizedClientLink>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
