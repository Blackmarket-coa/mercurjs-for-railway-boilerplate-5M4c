"use client"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import { useParams, usePathname } from "next/navigation"
import { CollapseIcon } from "@/icons"

export const CategoryNavbar = ({
  categories,
  onClose,
}: {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: (state: boolean) => void
}) => {
  const { category } = useParams()
  const pathname = usePathname()
  const isGardensActive = pathname?.includes("/gardens")
  const isProducersActive = pathname?.includes("/producers")

  return (
    <nav className="flex md:items-center flex-col md:flex-row">
      <LocalizedClientLink
        href="/categories"
        onClick={() => (onClose ? onClose(false) : null)}
        className={cn(
          "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between"
        )}
      >
        All Products
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/producers"
        onClick={() => (onClose ? onClose(false) : null)}
        className={cn(
          "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between",
          isProducersActive && "md:border-b md:border-primary"
        )}
      >
        Our Producers
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/gardens"
        onClick={() => (onClose ? onClose(false) : null)}
        className={cn(
          "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between",
          isGardensActive && "md:border-b md:border-primary"
        )}
      >
        Gardens
      </LocalizedClientLink>
      {categories?.map(({ id, handle, name }) => (
        <LocalizedClientLink
          key={id}
          href={`/categories/${handle}`}
          onClick={() => (onClose ? onClose(false) : null)}
          className={cn(
            "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between",
            handle === category && "md:border-b md:border-primary"
          )}
        >
          {name}
          <CollapseIcon size={18} className="-rotate-90 md:hidden" />
        </LocalizedClientLink>
      ))}
    </nav>
  )
}
