"use client"

import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"

export const CategoryFilter = ({
  categories,
}: {
  categories: { name: string }[]
}) => {
  const { updateFilters, isFilterActive } = useFilters("category")

  return (
    <Accordion heading="Category">
      <ul className="px-4">
        {categories.map(({ name }) => (
          <li key={name} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(name)}
              onCheck={() => updateFilters(name)}
              label={name}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}
