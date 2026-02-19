import type { Metadata } from "next"
import { redirect } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { createDemandPool, publishDemandPool } from "@/lib/data/collective"


export const metadata: Metadata = {
  title: "Create Demand Pool",
  description: "Start a new collective demand pool and invite community participation.",
}

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function NewDemandPoolPage({ params }: PageProps) {
  const { locale } = await params

  async function createAction(formData: FormData) {
    "use server"

    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const category = String(formData.get("category") || "").trim()
    const target_quantity = Number(formData.get("target_quantity"))
    const min_quantity = Number(formData.get("min_quantity"))
    const unit_of_measure = String(formData.get("unit_of_measure") || "units").trim()

    if (!title || !description || !target_quantity || !min_quantity) {
      throw new Error("Missing required fields")
    }

    const { demand_post } = await createDemandPool({
      title,
      description,
      category: category || undefined,
      target_quantity,
      min_quantity,
      unit_of_measure,
    })

    if (formData.get("publish_now") === "on") {
      await publishDemandPool(demand_post.id)
    }

    redirect(`/${locale}/collective/demand-pools/${demand_post.id}`)
  }

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="mb-2 text-2xl font-semibold">Create Demand Pool</h1>
      <p className="mb-6 text-sm text-ui-fg-subtle">
        Start a collective purchase and invite others to join.
      </p>

      <form action={createAction} className="space-y-4 rounded-md border p-5">
        <div>
          <label className="mb-1 block text-sm">Title</label>
          <input name="title" required className="w-full rounded border p-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm">Description</label>
          <textarea name="description" required rows={4} className="w-full rounded border p-2" />
        </div>

        <div>
          <label className="mb-1 block text-sm">Category</label>
          <input name="category" className="w-full rounded border p-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Target quantity</label>
            <input name="target_quantity" type="number" min={1} required className="w-full rounded border p-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Minimum quantity</label>
            <input name="min_quantity" type="number" min={1} required className="w-full rounded border p-2" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm">Unit of measure</label>
          <input name="unit_of_measure" defaultValue="units" className="w-full rounded border p-2" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish_now" defaultChecked />
          Publish immediately
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded bg-primary px-4 py-2 text-white">
            Create
          </button>
          <LocalizedClientLink href="/collective/demand-pools" className="text-sm underline">
            Cancel
          </LocalizedClientLink>
        </div>
      </form>
    </main>
  )
}
