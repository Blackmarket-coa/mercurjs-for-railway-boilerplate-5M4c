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

type CustomerAcceptedEmailProps = {
  customer_name?: string
  storefront_url?: string
  login_url?: string
}

function CustomerAcceptedEmailComponent({
  customer_name,
  storefront_url,
  login_url,
}: CustomerAcceptedEmailProps) {
  const callToActionUrl = storefront_url || login_url

  return (
    <Html>
      <Head />
      <Preview>Your customer account has been approved</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[24px] max-w-[520px]">
            <Section className="mt-[8px]">
              <Heading className="text-black text-[24px] font-semibold text-center p-0 my-[16px] mx-0">
                You're approved to shop!
              </Heading>
            </Section>

            <Section className="my-[16px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Hi{customer_name ? ` ${customer_name}` : ""},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                Your account has been accepted and you can now access the marketplace.
              </Text>
            </Section>

            <Section className="my-[16px]">
              <Text className="text-black text-[14px] leading-[24px] font-semibold">
                Here’s what you can do:
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">• Discover local vendors and unique products</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Place orders and track deliveries</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Save favorites and reorder quickly</Text>
              <Text className="text-black text-[14px] leading-[24px]">• Contact support with any questions</Text>
            </Section>

            {callToActionUrl ? (
              <Section className="text-center mt-[24px] mb-[24px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={callToActionUrl}
                >
                  Start exploring
                </Button>
              </Section>
            ) : null}

            {storefront_url ? (
              <Section className="my-[12px]">
                <Text className="text-black text-[14px] leading-[24px]">
                  Marketplace link:
                </Text>
                <Link
                  href={storefront_url}
                  className="text-blue-600 no-underline text-[14px] leading-[24px] break-all"
                >
                  {storefront_url}
                </Link>
              </Section>
            ) : null}

            {login_url ? (
              <Section className="my-[12px]">
                <Text className="text-black text-[14px] leading-[24px]">
                  Log in anytime:
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
                Need help? Reply to this email and our team will support you.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const customerAcceptedEmail = (props: CustomerAcceptedEmailProps) => (
  <CustomerAcceptedEmailComponent {...props} />
)

const mockCustomer: CustomerAcceptedEmailProps = {
  customer_name: "Sam",
  storefront_url: "https://shop.example.com",
  login_url: "https://shop.example.com/account",
}

export default () => <CustomerAcceptedEmailComponent {...mockCustomer} />
