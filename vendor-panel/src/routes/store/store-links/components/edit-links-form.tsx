import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Text, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Form } from "../../../../components/common/form"
import { RouteDrawer, useRouteModal } from "../../../../components/modals"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { StoreVendor } from "../../../../types/user"
import { useUpdateMe } from "../../../../hooks/api"

// URL validation helper
const urlSchema = z.string().url().optional().or(z.literal(""))

export const EditLinksSchema = z.object({
  // Primary website
  website_url: urlSchema,
  
  // Social media links
  social_instagram: urlSchema,
  social_facebook: urlSchema,
  social_twitter: urlSchema,
  social_tiktok: urlSchema,
  social_youtube: urlSchema,
  social_linkedin: urlSchema,
  social_pinterest: urlSchema,
  
  // External storefronts
  storefront_etsy: urlSchema,
  storefront_amazon: urlSchema,
  storefront_shopify: urlSchema,
  storefront_ebay: urlSchema,
  storefront_farmers_market: z.string().optional(),
})

export const EditLinksForm = ({ seller }: { seller: StoreVendor }) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<z.infer<typeof EditLinksSchema>>({
    defaultValues: {
      website_url: seller.website_url || "",
      social_instagram: seller.social_links?.instagram || "",
      social_facebook: seller.social_links?.facebook || "",
      social_twitter: seller.social_links?.twitter || "",
      social_tiktok: seller.social_links?.tiktok || "",
      social_youtube: seller.social_links?.youtube || "",
      social_linkedin: seller.social_links?.linkedin || "",
      social_pinterest: seller.social_links?.pinterest || "",
      storefront_etsy: seller.storefront_links?.etsy || "",
      storefront_amazon: seller.storefront_links?.amazon || "",
      storefront_shopify: seller.storefront_links?.shopify || "",
      storefront_ebay: seller.storefront_links?.ebay || "",
      storefront_farmers_market: seller.storefront_links?.farmers_market || "",
    },
    resolver: zodResolver(EditLinksSchema),
  })

  const { mutateAsync, isPending } = useUpdateMe()

  const handleSubmit = form.handleSubmit(async (values) => {
    // Build the social_links object
    const social_links = {
      instagram: values.social_instagram || undefined,
      facebook: values.social_facebook || undefined,
      twitter: values.social_twitter || undefined,
      tiktok: values.social_tiktok || undefined,
      youtube: values.social_youtube || undefined,
      linkedin: values.social_linkedin || undefined,
      pinterest: values.social_pinterest || undefined,
    }

    // Build the storefront_links object
    const storefront_links = {
      etsy: values.storefront_etsy || undefined,
      amazon: values.storefront_amazon || undefined,
      shopify: values.storefront_shopify || undefined,
      ebay: values.storefront_ebay || undefined,
      farmers_market: values.storefront_farmers_market || undefined,
    }

    await mutateAsync(
      {
        ...seller,
        website_url: values.website_url || undefined,
        social_links,
        storefront_links,
      },
      {
        onSuccess: () => {
          toast.success("Links updated successfully")
          handleSuccess()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col">
        <RouteDrawer.Body className="overflow-y-auto">
          <div className="flex flex-col gap-y-8">
            {/* Primary Website */}
            <div>
              <Text size="large" weight="plus" className="mb-4">
                Website
              </Text>
              <Form.Field
                name="website_url"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Primary Website URL</Form.Label>
                    <Form.Control>
                      <Input 
                        {...field} 
                        placeholder="https://yourfarm.com"
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            </div>

            {/* Social Media Links */}
            <div>
              <Text size="large" weight="plus" className="mb-4">
                Social Media
              </Text>
              <div className="flex flex-col gap-y-4">
                <Form.Field
                  name="social_instagram"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Instagram</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://instagram.com/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_facebook"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Facebook</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://facebook.com/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_twitter"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Twitter / X</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://twitter.com/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_tiktok"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>TikTok</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://tiktok.com/@yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_youtube"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>YouTube</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://youtube.com/@yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_linkedin"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>LinkedIn</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://linkedin.com/company/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="social_pinterest"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Pinterest</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://pinterest.com/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
              </div>
            </div>

            {/* External Storefronts */}
            <div>
              <Text size="large" weight="plus" className="mb-4">
                Other Storefronts
              </Text>
              <Text size="small" className="text-ui-fg-subtle mb-4">
                Let customers know where else they can find your products
              </Text>
              <div className="flex flex-col gap-y-4">
                <Form.Field
                  name="storefront_etsy"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Etsy Shop</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://etsy.com/shop/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="storefront_amazon"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Amazon Store</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://amazon.com/shops/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="storefront_shopify"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Shopify Store</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://yourfarm.myshopify.com"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="storefront_ebay"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>eBay Store</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="https://ebay.com/str/yourfarm"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="storefront_farmers_market"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Farmers Market Location</Form.Label>
                      <Form.Control>
                        <Input 
                          {...field} 
                          placeholder="e.g., Downtown Saturday Market, Booth 12"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
              </div>
            </div>
          </div>
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button size="small" isLoading={isPending} type="submit">
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
