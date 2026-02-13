import {
  Text,
  Container,
  Heading,
  Html,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Button,
  Link,
} from "@react-email/components"

type VendorAcceptedEmailProps = {
  seller_name: string
  member_name?: string
  vendor_panel_url?: string
  onboarding_url?: string
  login_url?: string
}

function VendorAcceptedEmailComponent({
  seller_name,
  member_name,
  vendor_panel_url,
  onboarding_url,
  login_url,
}: VendorAcceptedEmailProps) {
  const callToActionUrl = onboarding_url || vendor_panel_url

  return (
    <Html>
      <Head />
      <Preview>Your Free Black Market vendor access is ready</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[24px] max-w-[520px]">
            <Section className="mt-[8px]">
              <Heading className="text-black text-[24px] font-semibold text-center p-0 my-[16px] mx-0">
                You're approved to sell!
              </Heading>
            </Section>

            <Section className="my-[16px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Hi{member_name ? ` ${member_name}` : ""},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                Great news — your request for {seller_name} has been accepted. Free Black Market is now ready for you
                to build your vendor profile and start onboarding.
              </Text>
            </Section>

            <Section className="my-[16px]">
              <Text className="text-black text-[14px] leading-[24px] font-semibold">
                Quick onboarding flow:
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">1) Sign in and confirm your business details</Text>
              <Text className="text-black text-[14px] leading-[24px]">2) Complete your vendor profile (brand, logo, contact, and policies)</Text>
              <Text className="text-black text-[14px] leading-[24px]">3) Add your first products with pricing, images, and inventory</Text>
              <Text className="text-black text-[14px] leading-[24px]">4) Review your storefront and publish when ready</Text>
            </Section>

            {callToActionUrl ? (
              <Section className="text-center mt-[24px] mb-[24px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={callToActionUrl}
                >
                  Complete onboarding
                </Button>
              </Section>
            ) : null}

            {vendor_panel_url ? (
              <Section className="my-[12px]">
                <Text className="text-black text-[14px] leading-[24px]">
                  Vendor portal:
                </Text>
                <Link
                  href={vendor_panel_url}
                  className="text-blue-600 no-underline text-[14px] leading-[24px] break-all"
                >
                  {vendor_panel_url}
                </Link>
              </Section>
            ) : null}

            {login_url ? (
              <Section className="my-[12px]">
                <Text className="text-black text-[14px] leading-[24px]">
                  Already onboarded? Log in here:
                </Text>
                <Link
                  href={login_url}
                  className="text-blue-600 no-underline text-[14px] leading-[24px] break-all"
                >
                  {login_url}
                </Link>
              </Section>
            ) : null}

            <Section className="mt-[24px]">
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                If you have questions, reply to this email and our team will help you get started.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const vendorAcceptedEmail = (props: VendorAcceptedEmailProps) => (
  <VendorAcceptedEmailComponent {...props} />
)

const mockVendor: VendorAcceptedEmailProps = {
  seller_name: "Maple Grove Farms",
  member_name: "Jordan",
  vendor_panel_url: "https://vendor.example.com",
  onboarding_url: "https://vendor.example.com/onboarding",
  login_url: "https://vendor.example.com/login",
}

export default () => <VendorAcceptedEmailComponent {...mockVendor} />
