import { notFound } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getDemandPool } from "@/lib/data/collective"
import JoinDemandPoolForm from "./join-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DemandPoolDetailPage({ params }: PageProps) {
  const { id } = await params

  let pool
  try {
    pool = await getDemandPool(id)
  } catch {
    return notFound()
  }

  if (!pool) {
    return notFound()
  }

  const progress = Math.min(
    100,
    Math.round((Number(pool.committed_quantity) / Number(pool.target_quantity || 1)) * 100)
  )

  return (
    <main className="container max-w-3xl py-10">
      <LocalizedClientLink href="/collective/demand-pools" className="mb-4 inline-block text-sm underline">
        &larr; Back to demand pools
      </LocalizedClientLink>

      <div className="rounded-md border p-5">
        <div className="mb-1 text-xs uppercase text-ui-fg-subtle">
          {pool.category || "General"} &middot; {pool.status}
        </div>
        <h1 className="mb-2 text-2xl font-semibold">{pool.title}</h1>
        <p className="mb-5 text-sm text-ui-fg-subtle">{pool.description}</p>

        <div className="mb-2 text-sm">
          <strong>{pool.committed_quantity}</strong> committed out of <strong>{pool.target_quantity}</strong>{" "}
          {pool.unit_of_measure || "units"}
        </div>
        <div className="h-2 w-full rounded bg-ui-bg-subtle">
          <div className="h-2 rounded bg-primary" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded border p-3">
            <div className="text-xs uppercase text-ui-fg-subtle">Participants</div>
            <div className="text-lg font-semibold">{pool.participants?.total || 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs uppercase text-ui-fg-subtle">Supplier Proposals</div>
            <div className="text-lg font-semibold">{pool.proposals?.total || 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs uppercase text-ui-fg-subtle">Bounties</div>
            <div className="text-lg font-semibold">{pool.bounties?.total || 0}</div>
          </div>
        </div>
      </div>

      <JoinDemandPoolForm poolId={id} />
    </main>
  )
}
