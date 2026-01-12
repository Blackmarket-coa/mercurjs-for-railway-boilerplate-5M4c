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
  return (
    <div className="flex border py-4 justify-between px-6">
      <div className="hidden md:flex items-center">
        {/* Use TypeNavbar if CMS types are available, otherwise fall back to CategoryNavbar */}
        {cmsTypes && cmsTypes.length > 0 ? (
          <TypeNavbar types={cmsTypes} />
        ) : (
          <CategoryNavbar categories={categories} />
        )}
      </div>

      <NavbarSearch />
    </div>
  )
}
