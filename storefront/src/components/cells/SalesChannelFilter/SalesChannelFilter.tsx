"use client"

import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"

export const SalesChannelFilter = ({
  salesChannels,
}: {
  salesChannels: { name: string }[]
}) => {
  const { updateFilters, isFilterActive } = useFilters("sales_channel")

  return (
    <Accordion heading="Sales Channel">
      <ul className="px-4">
        {salesChannels.map(({ name }) => (
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
