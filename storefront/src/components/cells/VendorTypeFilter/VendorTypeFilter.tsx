"use client"

import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"

const vendorTypes = [
  { value: "producer", label: "Producers" },
  { value: "garden", label: "Community Gardens" },
  { value: "kitchen", label: "Community Kitchens" },
  { value: "maker", label: "Makers & Artisans" },
  { value: "restaurant", label: "Restaurants" },
  { value: "mutual_aid", label: "Mutual Aid" },
]

export const VendorTypeFilter = () => {
  const { updateFilters, isFilterActive } = useFilters("vendor_type")

  return (
    <Accordion heading="Vendor Type">
      <ul className="px-4">
        {vendorTypes.map(({ value, label }) => (
          <li key={value} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(value)}
              onCheck={() => updateFilters(value)}
              label={label}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}
