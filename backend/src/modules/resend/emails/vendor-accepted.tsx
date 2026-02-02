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
      <Preview>Your vendor account has been approved</Preview>
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
                Great news — {seller_name} has been accepted. You now have access to the vendor toolkit so you can
                start listing products and fulfilling orders.
              </Text>
            </Section>

            <Section className="my-[16px]">
              <Text className="text-black text-[14px] leading-[24px] font-semibold">
                What you can do next:
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">• Publish products and manage inventory</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Accept, pack, and fulfill orders</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Track payouts and performance insights</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Connect with customers through messages</Text>
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
