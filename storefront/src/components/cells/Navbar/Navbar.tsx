import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch, TypeNavbar } from "@/components/molecules"
import { CmsType } from "@/lib/data/cms-taxonomy"

export const Navbar = ({
  categories,
  cmsTypes,
}: {
  categories: HttpTypes.StoreProductCategory[]
  cmsTypes: CmsType[]
}) => {
  // Debug: Log what we receive
  const hasTypes = cmsTypes && Array.isArray(cmsTypes) && cmsTypes.length > 0

  return (
    <div className="flex border py-4 justify-between px-6">
      <div className="hidden md:flex items-center">
        {/* Always use TypeNavbar with the types we have */}
        <TypeNavbar types={cmsTypes || []} />
      </div>

      <NavbarSearch />
    </div>
  )
}
