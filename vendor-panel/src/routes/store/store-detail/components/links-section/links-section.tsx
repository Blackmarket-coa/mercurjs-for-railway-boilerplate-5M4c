import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { Pencil } from "@medusajs/icons"

import { StoreVendor } from "../../../../../types/user"
import { ActionMenu } from "../../../../../components/common/action-menu"

// Social media icons as simple components
const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const LinkIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

interface LinkItemProps {
  label: string
  url?: string
  icon: React.ReactNode
}

const LinkItem = ({ label, url, icon }: LinkItemProps) => {
  if (!url) return null
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
    >
      {icon}
      <Text size="small">{label}</Text>
    </a>
  )
}

export const LinksSection = ({ seller }: { seller: StoreVendor }) => {
  const hasSocialLinks = seller.social_links && Object.values(seller.social_links).some(v => v)
  const hasStorefrontLinks = seller.storefront_links && Object.values(seller.storefront_links).some(v => v)
  const hasWebsite = !!seller.website_url
  const hasAnyLinks = hasSocialLinks || hasStorefrontLinks || hasWebsite

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Social Media & Storefronts</Heading>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <Pencil />,
                  label: "Edit Links",
                  to: "links",
                },
              ],
            },
          ]}
        />
      </div>

      {!hasAnyLinks ? (
        <div className="px-6 py-8 text-center">
          <Text size="small" className="text-ui-fg-muted">
            No social media or storefront links added yet.
          </Text>
          <Text size="small" className="text-ui-fg-muted mt-1">
            Add links to help customers find you on other platforms.
          </Text>
        </div>
      ) : (
        <>
          {/* Website */}
          {hasWebsite && (
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-2">
                Website
              </Text>
              <LinkItem 
                label={seller.website_url!} 
                url={seller.website_url} 
                icon={<LinkIcon />} 
              />
            </div>
          )}

          {/* Social Media */}
          {hasSocialLinks && (
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-3">
                Social Media
              </Text>
              <div className="flex flex-wrap gap-3">
                {seller.social_links?.instagram && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <InstagramIcon />
                    <a 
                      href={seller.social_links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Instagram
                    </a>
                  </Badge>
                )}
                {seller.social_links?.facebook && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <FacebookIcon />
                    <a 
                      href={seller.social_links.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Facebook
                    </a>
                  </Badge>
                )}
                {seller.social_links?.twitter && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <TwitterIcon />
                    <a 
                      href={seller.social_links.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Twitter/X
                    </a>
                  </Badge>
                )}
                {seller.social_links?.tiktok && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <TikTokIcon />
                    <a 
                      href={seller.social_links.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      TikTok
                    </a>
                  </Badge>
                )}
                {seller.social_links?.youtube && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <YouTubeIcon />
                    <a 
                      href={seller.social_links.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      YouTube
                    </a>
                  </Badge>
                )}
                {seller.social_links?.linkedin && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <LinkIcon />
                    <a 
                      href={seller.social_links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      LinkedIn
                    </a>
                  </Badge>
                )}
                {seller.social_links?.pinterest && (
                  <Badge className="flex items-center gap-1.5 px-3 py-1.5">
                    <LinkIcon />
                    <a 
                      href={seller.social_links.pinterest} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Pinterest
                    </a>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* External Storefronts */}
          {hasStorefrontLinks && (
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-3">
                Other Storefronts
              </Text>
              <div className="flex flex-col gap-2">
                {seller.storefront_links?.etsy && (
                  <LinkItem label="Etsy Shop" url={seller.storefront_links.etsy} icon={<LinkIcon />} />
                )}
                {seller.storefront_links?.amazon && (
                  <LinkItem label="Amazon Store" url={seller.storefront_links.amazon} icon={<LinkIcon />} />
                )}
                {seller.storefront_links?.shopify && (
                  <LinkItem label="Shopify Store" url={seller.storefront_links.shopify} icon={<LinkIcon />} />
                )}
                {seller.storefront_links?.ebay && (
                  <LinkItem label="eBay Store" url={seller.storefront_links.ebay} icon={<LinkIcon />} />
                )}
                {seller.storefront_links?.farmers_market && (
                  <div className="flex items-center gap-2 text-ui-fg-subtle">
                    <LinkIcon />
                    <Text size="small">Farmers Market: {seller.storefront_links.farmers_market}</Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  )
}
