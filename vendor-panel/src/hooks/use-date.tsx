import { format, formatDistance, sub } from "date-fns"
import { enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"

import { languages } from "../i18n/languages"

const resolveLocale = (language?: string) => {
  if (!language) {
    return enUS
  }

  const normalized = language.toLowerCase()
  const directMatch = languages.find(
    (entry) => entry.code.toLowerCase() === normalized
  )

  if (directMatch) {
    return directMatch.date_locale
  }

  const baseCode = normalized.split("-")[0]
  const baseMatch = languages.find(
    (entry) => entry.code.toLowerCase() === baseCode
  )

  return baseMatch?.date_locale || enUS
}

export const useDate = () => {
  const { i18n } = useTranslation()

  const locale = resolveLocale(i18n.resolvedLanguage || i18n.language)

  const getFullDate = ({
    date,
    includeTime = false,
  }: {
    date: string | Date
    includeTime?: boolean
  }) => {
    const ensuredDate = new Date(date)

    if (isNaN(ensuredDate.getTime())) {
      return ""
    }

    const timeFormat = includeTime ? "p" : ""

    return format(ensuredDate, `PP ${timeFormat}`, {
      locale,
    })
  }

  function getRelativeDate(date: string | Date): string {
    const now = new Date()

    return formatDistance(sub(new Date(date), { minutes: 0 }), now, {
      addSuffix: true,
      locale,
    })
  }

  return {
    getFullDate,
    getRelativeDate,
  }
}
