import { PencilSquare, User } from "@medusajs/icons";
import { Badge, Container, Divider, Heading, Text, usePrompt } from "@medusajs/ui";

import { useNavigate } from "react-router-dom";

import type { VendorSeller } from "@custom-types/seller";
import { VendorTypeLabels } from "@custom-types/domain";

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

  const vendorTypeLabel = seller.seller_metadata?.vendor_type
    ? VendorTypeLabels[seller.seller_metadata.vendor_type as keyof typeof VendorTypeLabels] || seller.seller_metadata.vendor_type
    : "Not set";

  return (
    <>
      <div>
        <Container className="mb-2">
          <div className="flex items-center justify-between">
            <Heading>{seller.email || seller.name}</Heading>
            <div className="flex items-center gap-2">
              <SellerStatusBadge status={seller.store_status || "pending"} />
              {seller.seller_metadata?.verified && (
                <Badge color="green">Verified</Badge>
              )}
              {seller.seller_metadata?.featured && (
                <Badge color="purple">Featured</Badge>
              )}
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
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Vendor Type
              </Text>
              <Text className="w-1/2">{vendorTypeLabel}</Text>
            </div>
            {seller.seller_metadata?.growing_region && (
              <>
                <Divider />
                <div className="flex px-8 py-4">
                  <Text className="w-1/2 font-medium text-ui-fg-subtle">
                    Growing Region
                  </Text>
                  <Text className="w-1/2">{seller.seller_metadata.growing_region}</Text>
                </div>
              </>
            )}
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
      {seller.producer && (
        <Container className="px-0 mt-4">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <Heading>Producer Information</Heading>
            </div>
          </div>
          <div>
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Farm Name
              </Text>
              <Text className="w-1/2">{seller.producer.name}</Text>
            </div>
            {seller.producer.region && (
              <>
                <Divider />
                <div className="flex px-8 py-4">
                  <Text className="w-1/2 font-medium text-ui-fg-subtle">
                    Region
                  </Text>
                  <Text className="w-1/2">{seller.producer.region}</Text>
                </div>
              </>
            )}
            {seller.producer.farm_size_acres && (
              <>
                <Divider />
                <div className="flex px-8 py-4">
                  <Text className="w-1/2 font-medium text-ui-fg-subtle">
                    Farm Size
                  </Text>
                  <Text className="w-1/2">{seller.producer.farm_size_acres} acres</Text>
                </div>
              </>
            )}
            {seller.producer.practices && seller.producer.practices.length > 0 && (
              <>
                <Divider />
                <div className="flex px-8 py-4">
                  <Text className="w-1/2 font-medium text-ui-fg-subtle">
                    Practices
                  </Text>
                  <div className="w-1/2 flex flex-wrap gap-1">
                    {seller.producer.practices.map((practice) => (
                      <Badge key={practice} color="blue">
                        {practice}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Divider />
            <div className="flex px-8 py-4">
              <Text className="w-1/2 font-medium text-ui-fg-subtle">
                Verified
              </Text>
              <Text className="w-1/2">
                {seller.producer.verified ? (
                  <Badge color="green">Yes</Badge>
                ) : (
                  <Badge color="orange">No</Badge>
                )}
              </Text>
            </div>
          </div>
        </Container>
      )}
    </>
  );
};
