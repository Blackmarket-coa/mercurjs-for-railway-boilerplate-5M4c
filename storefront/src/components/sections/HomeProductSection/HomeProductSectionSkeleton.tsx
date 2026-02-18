export const HomeProductSectionSkeleton = () => {
  return (
    <section className="w-full rounded-3xl border border-zinc-200/70 bg-gradient-to-b from-white via-zinc-50/60 to-zinc-100/40 px-4 py-10 md:px-6" aria-busy="true" aria-live="polite">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-64 rounded bg-zinc-200 animate-pulse" />
        <div className="h-5 w-80 rounded bg-zinc-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="aspect-[4/3] w-full rounded bg-zinc-200 animate-pulse" />
            <div className="mt-3 h-4 w-1/2 rounded bg-zinc-200 animate-pulse" />
            <div className="mt-2 h-5 w-3/4 rounded bg-zinc-100 animate-pulse" />
            <div className="mt-3 h-4 w-24 rounded bg-zinc-200 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}
