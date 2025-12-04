import { PencilSquare, User } from "@medusajs/icons";
import { Container, Divider, Heading, Text, usePrompt } from "@medusajs/ui";

import { useNavigate } from "react-router-dom";

import type { VendorSeller } from "@custom-types/seller";

import { ActionsButton } from "@components/common/actions-button";
import { SellerStatusBadge } from "@components/common/seller-status-badge";

import { useUpdateSeller } from "@hooks/api/sellers";

export const SellerGeneralSection = ({ seller }: { seller: VendorSeller }) => {
  const navigate = useNavigate();

  const { mutateAsync: suspendSeller } = useUpdateSeller();

  const dialog = usePrompt();

  const handleSuspend = async () => {
    const res = await dialog({
      title:
        seller.store_status === "SUSPENDED"
          ? "Activate account"
          : "Suspend account",
      description:
        seller.store_status === "SUSPENDED"
          ? "Are you sure you want to activate this account?"
          : "Are you sure you want to suspend this account?",
      verificationText: seller.email || seller.name || "",
    });

    if (!res) {
      return;
    }

    if (seller.store_status === "SUSPENDED") {
      await suspendSeller({ id: seller.id, data: { store_status: "ACTIVE" } });
    } else {
      await suspendSeller({
        id: seller.id,
        data: { store_status: "SUSPENDED" },
      });
    }
  };

  return (
    <>
      <div>
        <Container className="mb-2">
          <div className="flex items-center justify-between">
            <Heading>{seller.email || seller.name}</Heading>
            <div className="flex items-center gap-2">
              <SellerStatusBadge status={seller.store_status || "pending"} />
              <ActionsButton
                actions={[
                  {
                    label: "Edit",
                    onClick: () => navigate(`/sellers/${seller.id}/edit`),
                    icon: <PencilSquare />,
                  },
                  {
                    label:
                      seller.store_status === "SUSPENDED"
                        ? "Activate account"
                        : "Suspend account",
                    onClick: () => handleSuspend(),
                    icon: <User />,
                  },
                ]}
              />
            </div>
          </div>
        </Container>
      </div>
      <div className="flex gap-4">
        <Container className="px-0">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading>Store</Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">Name</Text>
              <Text className="w-1/2">{seller.name}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">Email</Text>
              <Text className="w-1/2">{seller.email}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">Phone</Text>
              <Text className="w-1/2">{seller.phone}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Description
              </Text>
              <Text className="w-1/2">{seller.description}</Text>
            </div>
          </div>
        </Container>
        <Container className="px-0">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading>Address</Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Address
              </Text>
              <Text className="w-1/2">{seller.address_line}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Postal Code
              </Text>
              <Text className="w-1/2">{seller.postal_code}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">City</Text>
              <Text className="w-1/2">{seller.city}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Country
              </Text>
              <Text className="w-1/2">{seller.country_code}</Text>
            </div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">TaxID</Text>
              <Text className="w-1/2">{seller.tax_id}</Text>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
