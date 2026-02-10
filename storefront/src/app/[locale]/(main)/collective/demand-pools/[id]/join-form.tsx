"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { joinDemandPool } from "@/lib/data/collective"

export default function JoinDemandPoolForm({ poolId }: { poolId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMessage("")

    const formData = new FormData(e.currentTarget)
    const quantity_committed = Number(formData.get("quantity_committed"))
    const price = formData.get("price_willing_to_pay")
    const price_willing_to_pay = price ? Number(price) : undefined

    if (!quantity_committed || quantity_committed <= 0) {
      setStatus("error")
      setErrorMessage("Quantity committed must be positive")
      return
    }

    try {
      await joinDemandPool(poolId, {
        quantity_committed,
        price_willing_to_pay,
      })
      setStatus("success")
      router.refresh()
    } catch (err: any) {
      setStatus("error")
      setErrorMessage(err?.message || "Failed to join demand pool")
    }
  }

  if (status === "success") {
    return (
      <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-5 text-sm text-green-800">
        You have successfully joined this demand pool. Your committed quantity has been recorded.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 rounded-md border p-5">
      <h2 className="mb-3 text-lg font-medium">Join this demand pool</h2>

      {status === "error" && errorMessage && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

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

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
      >
        {status === "submitting" ? "Joining..." : "Commit quantity"}
      </button>
    </form>
  )
}
