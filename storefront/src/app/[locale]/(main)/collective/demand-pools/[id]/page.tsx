import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getDemandPool, joinDemandPool } from "@/lib/data/collective"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DemandPoolDetailPage({ params }: PageProps) {
  const { id } = await params
  const pool = await getDemandPool(id)

  async function joinAction(formData: FormData) {
    "use server"

    const quantity_committed = Number(formData.get("quantity_committed"))
    const price = formData.get("price_willing_to_pay")
    const price_willing_to_pay = price ? Number(price) : undefined

    if (!quantity_committed || quantity_committed <= 0) {
      throw new Error("Quantity committed must be positive")
    }

    await joinDemandPool(id, {
      quantity_committed,
      price_willing_to_pay,
    })
  }

  const progress = Math.min(
    100,
    Math.round((Number(pool.committed_quantity) / Number(pool.target_quantity || 1)) * 100)
  )

  return (
    <main className="container max-w-3xl py-10">
      <LocalizedClientLink href="/collective/demand-pools" className="mb-4 inline-block text-sm underline">
        ← Back to demand pools
      </LocalizedClientLink>

      <div className="rounded-md border p-5">
        <div className="mb-1 text-xs uppercase text-ui-fg-subtle">
          {pool.category || "General"} · {pool.status}
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

      <form action={joinAction} className="mt-6 rounded-md border p-5">
        <h2 className="mb-3 text-lg font-medium">Join this demand pool</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Quantity committed</label>
            <input name="quantity_committed" type="number" min={1} required className="w-full rounded border p-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Max unit price (optional)</label>
            <input name="price_willing_to_pay" type="number" min={0} step="0.01" className="w-full rounded border p-2" />
          </div>
        </div>

        <button type="submit" className="mt-4 rounded bg-primary px-4 py-2 text-white">
          Commit quantity
        </button>
      </form>
    </main>
  )
}
