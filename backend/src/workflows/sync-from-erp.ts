import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

type Input = {
  offset: number
  limit: number
}

const getProductsFromErp = createStep(
  "get-products-from-erp",
  async (input: Input, { container }) => {
    const odooModuleService = container.resolve("odoo")

    const products = await odooModuleService.listProducts(undefined, input)

    return new StepResponse(products)
  }
)
  import { 
  createWorkflow, transform, WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  createProductsWorkflow, updateProductsWorkflow, useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { 
  CreateProductWorkflowInputDTO, UpdateProductWorkflowInputDTO,
} from "@medusajs/framework/types"
export const syncFromErpWorkflow = createWorkflow(
  "sync-from-erp",
  (input: Input) => {
    const odooProducts = getProductsFromErp(input)

    // @ts-ignore
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: [
        "default_sales_channel_id",
      ],
    })

    // @ts-ignore
    const { data: shippingProfiles } = useQueryGraphStep({
      entity: "shipping_profile",
      fields: ["id"],
      pagination: {
        take: 1,
      },
    }).config({ name: "shipping-profile" })

    const externalIdsFilters = transform({
      odooProducts,
    }, (data) => {
      return data.odooProducts.map((product) => `${product.id}`)
    })

    // @ts-ignore
    const { data: existingProducts } = useQueryGraphStep({
      entity: "product",
      fields: ["id", "external_id", "variants.*"],
      filters: {
        // @ts-ignore
        external_id: externalIdsFilters,
      },
    }).config({ name: "existing-products" })

    const {
  productsToCreate,
  productsToUpdate,
} = transform({
  existingProducts,
  odooProducts,
  shippingProfiles,
  stores,
}, (data) => {
  const productsToCreate: CreateProductWorkflowInputDTO[] = []
  const productsToUpdate: UpdateProductWorkflowInputDTO[] = []

  data.odooProducts.forEach((odooProduct) => {
    const product: CreateProductWorkflowInputDTO | UpdateProductWorkflowInputDTO = {
      external_id: `${odooProduct.id}`,
      title: odooProduct.display_name,
      description: odooProduct.description || odooProduct.description_sale || "",
      status: odooProduct.is_published ? "published" : "draft",
      options: odooProduct.attribute_line_ids.length ? odooProduct.attribute_line_ids.map((attribute) => {
        return {
          title: attribute.attribute_id.display_name,
          values: attribute.value_ids.map((value) => value.display_name),
        }
      }) : [
        {
          title: "Default",
          values: ["Default"],
        },
      ],
      hs_code: odooProduct.hs_code || "",
      handle: odooProduct.website_url.replace("/shop/", ""),
      variants: [],
      shipping_profile_id: data.shippingProfiles[0].id,
      sales_channels: [
        {
          id: data.stores[0].default_sales_channel_id || "",
        },
      ],
    }

    const existingProduct = data.existingProducts.find((p) => p.external_id === product.external_id)
    if (existingProduct) {
      product.id = existingProduct.id
    }

    if (odooProduct.product_variant_ids?.length) {
      product.variants = odooProduct.product_variant_ids.map((variant) => {
        const options = {}
        if (variant.product_template_variant_value_ids.length) {
          variant.product_template_variant_value_ids.forEach((value) => {
            options[value.attribute_id.display_name] = value.name
          })
        } else {
          product.options?.forEach((option) => {
            options[option.title] = option.values[0]
          })
        }
        return {
          id: existingProduct ? existingProduct.variants.find((v) => v.sku === variant.code)?.id : undefined,
          title: variant.display_name.replace(`[${variant.code}] `, ""),
          sku: variant.code || undefined,
          options,
          prices: [
            {
              amount: variant.list_price,
              currency_code: variant.currency_id.display_name.toLowerCase(),
            },
          ],
          manage_inventory: false, // change to true if syncing inventory from Odoo
          metadata: {
            external_id: `${variant.id}`,
          },
        }
      })
    } else {
      product.variants?.push({
        id: existingProduct ? existingProduct.variants[0].id : undefined,
        title: "Default",
        options: {
          Default: "Default",
        },
        // @ts-ignore
        prices: [
          {
            amount: odooProduct.list_price,
            currency_code: odooProduct.currency_id.display_name.toLowerCase(),
          },
        ],
        metadata: {
          external_id: `${odooProduct.id}`,
        },
        manage_inventory: false, // change to true if syncing inventory from Odoo
      })
    }

    if (existingProduct) {
      productsToUpdate.push(product as UpdateProductWorkflowInputDTO)
    } else {
      productsToCreate.push(product as CreateProductWorkflowInputDTO)
    }
  })

  return {
    productsToCreate,
    productsToUpdate,
  }
})

createProductsWorkflow.runAsStep({
  input: {
    products: productsToCreate,
  },
})

updateProductsWorkflow.runAsStep({
  input: {
    products: productsToUpdate,
  },
})

return new WorkflowResponse({
  odooProducts,
})
  }
)
