import { liteClient as algoliasearch } from "algoliasearch/lite"

const algoliaId = process.env.NEXT_PUBLIC_ALGOLIA_ID || ""
const algoliaSearchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""

export const client = algoliasearch(algoliaId, algoliaSearchKey)
