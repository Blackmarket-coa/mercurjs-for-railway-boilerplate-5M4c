"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import { CollapseIcon } from "@/icons"
import { CmsType, CmsCategory } from "@/lib/data/cms-taxonomy"

// Short names for responsive display
const SHORT_NAMES: Record<string, string> = {
  "food-produce": "Food",
  "prepared-foods-meals": "Meals",
  "supplies-goods": "Supplies",
  "services-delivery": "Services",
  "organizations-partnerships": "Orgs",
  "equipment-tools": "Equipment",
}

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleMouseEnter = (typeId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenDropdown(typeId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  const isTypeActive = (typeHandle: string) => {
    return pathname?.includes(`/type/${typeHandle}`)
  }

  const isCategoryActive = (categoryHandle: string) => {
    return pathname?.includes(`/category/${categoryHandle}`)
  }

  const getShortName = (type: CmsType) => {
    return SHORT_NAMES[type.handle] || type.name.split(" ")[0]
  }

  return (
    <nav className="flex md:items-center flex-col md:flex-row">
      {/* Shop All Products */}
      <LocalizedClientLink
        href="/categories"
        onClick={() => onClose?.(false)}
        className="label-md uppercase px-4 py-2 hover:bg-secondary transition-colors"
      >
        All Products
      </LocalizedClientLink>

      {/* Type Dropdowns */}
      {types?.filter(t => t.is_active).sort((a, b) => a.display_order - b.display_order).map((type) => (
        <div
          key={type.id}
          className="relative"
          ref={(el) => {
            if (el) dropdownRefs.current.set(type.id, el)
          }}
          onMouseEnter={() => handleMouseEnter(type.id)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setOpenDropdown(openDropdown === type.id ? null : type.id)}
            className={cn(
              "label-md uppercase px-4 py-2 flex items-center gap-1 hover:bg-secondary transition-colors whitespace-nowrap",
              isTypeActive(type.handle) && "bg-secondary font-semibold"
            )}
          >
            {type.icon && <span className="text-sm">{type.icon}</span>}
            <span className="hidden lg:inline">{type.name}</span>
            <span className="lg:hidden">{getShortName(type)}</span>
            <CollapseIcon
              size={12}
              className={cn(
                "transition-transform",
                openDropdown === type.id ? "rotate-180" : ""
              )}
            />
          </button>

          {openDropdown === type.id && (
            <div
              className="absolute left-0 top-full mt-1 bg-primary border border-gray-200 rounded-lg shadow-lg z-30 min-w-[220px] py-2"
            >
              {/* Type Header - always show even without categories */}
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
              {type.categories && type.categories.length > 0 && (
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
              )}

              {/* If no categories, show a helpful message */}
              {(!type.categories || type.categories.length === 0) && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Browse all {type.name.toLowerCase()}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Vendors Directory */}
      <LocalizedClientLink
        href="/vendors"
        onClick={() => onClose?.(false)}
        className={cn(
          "label-md uppercase px-4 py-2 hover:bg-secondary transition-colors",
          pathname?.includes("/vendors") && "bg-secondary font-semibold"
        )}
      >
        Vendors
      </LocalizedClientLink>

      {/* Collections */}
      <LocalizedClientLink
        href="/collections"
        onClick={() => onClose?.(false)}
        className={cn(
          "label-md uppercase px-4 py-2 hover:bg-secondary transition-colors",
          pathname?.includes("/collections") && "bg-secondary font-semibold"
        )}
      >
        Collections
      </LocalizedClientLink>

      <span className="label-md uppercase px-4 py-2 text-ui-fg-subtle whitespace-nowrap">
        Demand Pooling
      </span>
    </nav>
  )
}

export default TypeNavbar
