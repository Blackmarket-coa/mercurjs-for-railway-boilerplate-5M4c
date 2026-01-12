"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import { CollapseIcon } from "@/icons"
import { CmsType, CmsCategory } from "@/lib/data/cms-taxonomy"

export const TypeNavbar = ({
  types,
  onClose,
}: {
  types: CmsType[]
  onClose?: (state: boolean) => void
}) => {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let clickedInside = false
      dropdownRefs.current.forEach((ref) => {
        if (ref && ref.contains(event.target as Node)) {
          clickedInside = true
        }
      })
      if (!clickedInside) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isTypeActive = (typeHandle: string) => {
    return pathname?.includes(`/type/${typeHandle}`)
  }

  const isCategoryActive = (categoryHandle: string) => {
    return pathname?.includes(`/category/${categoryHandle}`)
  }

  return (
    <nav className="flex md:items-center flex-col md:flex-row gap-1">
      {/* Shop All Products */}
      <LocalizedClientLink
        href="/categories"
        onClick={() => onClose?.(false)}
        className={cn(
          "label-md uppercase px-3 py-2 flex items-center justify-between hover:bg-secondary rounded transition-colors"
        )}
      >
        All Products
      </LocalizedClientLink>

      {/* Type Dropdowns */}
      {types?.filter(t => t.is_active).map((type) => (
        <div
          key={type.id}
          className="relative"
          ref={(el) => {
            if (el) dropdownRefs.current.set(type.id, el)
          }}
        >
          <button
            onClick={() => setOpenDropdown(openDropdown === type.id ? null : type.id)}
            onMouseEnter={() => setOpenDropdown(type.id)}
            className={cn(
              "label-md uppercase px-3 py-2 flex items-center gap-1 hover:bg-secondary rounded transition-colors whitespace-nowrap",
              isTypeActive(type.handle) && "bg-secondary font-semibold"
            )}
          >
            {type.icon && <span className="text-base mr-1">{type.icon}</span>}
            <span className="hidden xl:inline">{type.name}</span>
            <span className="xl:hidden">{type.icon ? "" : type.name.split(" ")[0]}</span>
            <CollapseIcon
              size={14}
              className={cn(
                "transition-transform ml-1",
                openDropdown === type.id ? "rotate-180" : ""
              )}
            />
          </button>

          {openDropdown === type.id && type.categories && type.categories.length > 0 && (
            <div
              className="absolute left-0 top-full mt-1 bg-primary border border-gray-200 rounded-lg shadow-lg z-30 min-w-[220px] py-2"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {/* Type Header */}
              <div className="px-4 py-2 border-b border-gray-100">
                <LocalizedClientLink
                  href={`/type/${type.handle}`}
                  onClick={() => {
                    setOpenDropdown(null)
                    onClose?.(false)
                  }}
                  className="text-sm font-semibold text-gray-700 hover:text-green-700 flex items-center gap-2"
                >
                  {type.icon && <span>{type.icon}</span>}
                  View All {type.name}
                </LocalizedClientLink>
              </div>

              {/* Categories */}
              <div className="max-h-[300px] overflow-y-auto">
                {type.categories
                  .filter((cat: CmsCategory) => cat.is_active)
                  .sort((a: CmsCategory, b: CmsCategory) => a.display_order - b.display_order)
                  .map((category: CmsCategory) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/category/${category.handle}`}
                      onClick={() => {
                        setOpenDropdown(null)
                        onClose?.(false)
                      }}
                      className={cn(
                        "block px-4 py-2 text-sm hover:bg-secondary transition-colors",
                        isCategoryActive(category.handle) && "bg-secondary font-medium"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {category.icon && <span className="text-base">{category.icon}</span>}
                        {category.name}
                      </span>
                    </LocalizedClientLink>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Our Producers */}
      <LocalizedClientLink
        href="/producers"
        onClick={() => onClose?.(false)}
        className={cn(
          "label-md uppercase px-3 py-2 flex items-center justify-between hover:bg-secondary rounded transition-colors",
          pathname?.includes("/producers") && "bg-secondary font-semibold"
        )}
      >
        Producers
      </LocalizedClientLink>
    </nav>
  )
}

export default TypeNavbar
