"use client"

import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"

export const ProductTypeFilter = ({
  productTypes,
}: {
  productTypes: { value: string }[]
}) => {
  const { updateFilters, isFilterActive } = useFilters("type")

  return (
    <Accordion heading="Product Type">
      <ul className="px-4">
        {productTypes.map(({ value }) => (
          <li key={value} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(value)}
              onCheck={() => updateFilters(value)}
              label={value}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}
