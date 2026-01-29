import SellerExtensionService from "./service"

type MethodName =
  | "createSellerMetadatas"
  | "createSellerMetadata"
  | "updateSellerMetadatas"
  | "updateSellerMetadata"
  | "deleteSellerMetadatas"
  | "deleteSellerMetadata"
  | "create"
  | "update"
  | "delete"

type SellerExtensionServiceLike = SellerExtensionService & {
  [key in MethodName]?: (...args: any[]) => any
}

const resolveServiceMethod = (
  service: SellerExtensionServiceLike,
  methodNames: MethodName[]
) => {
  for (const name of methodNames) {
    const candidate = service[name]
    if (typeof candidate === "function") {
      return candidate.bind(service)
    }
  }

  throw new Error(
    `SellerExtensionService is missing expected methods: ${methodNames.join(", ")}`
  )
}

export const createSellerMetadataRecord = async (
  service: SellerExtensionServiceLike,
  data: Record<string, unknown> | Record<string, unknown>[]
) => {
  const create = resolveServiceMethod(service, [
    "createSellerMetadatas",
    "createSellerMetadata",
    "create",
  ])
  return create(data)
}

export const updateSellerMetadataRecord = async (
  service: SellerExtensionServiceLike,
  data: Record<string, unknown> | Record<string, unknown>[]
) => {
  const update = resolveServiceMethod(service, [
    "updateSellerMetadatas",
    "updateSellerMetadata",
    "update",
  ])
  return update(data)
}

export const deleteSellerMetadataRecord = async (
  service: SellerExtensionServiceLike,
  data: string | string[]
) => {
  const remove = resolveServiceMethod(service, [
    "deleteSellerMetadatas",
    "deleteSellerMetadata",
    "delete",
  ])
  return remove(data)
}
