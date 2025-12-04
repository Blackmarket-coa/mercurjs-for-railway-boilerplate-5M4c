import { Button, Heading, Input, Textarea, toast } from "@medusajs/ui";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type { VendorSeller } from "@custom-types/seller";

import { Form } from "@components/common/form";
import { RouteDrawer, useRouteModal } from "@components/modals";
import { KeyboundForm } from "@components/utilities/keybound-form";

import { useUpdateSeller } from "@hooks/api/sellers";

type SellerEditFormProps = {
  seller: VendorSeller;
};

const SellerEditSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  description: z.string().optional(),
  address_line: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country_code: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
});

export const SellerEditForm = ({ seller }: SellerEditFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const form = useForm<z.infer<typeof SellerEditSchema>>({
    defaultValues: {
      name: seller?.name,
      email: seller?.email || "",
      phone: seller?.phone || undefined,
      description: seller?.description || undefined,
      address_line: seller?.address_line || undefined,
      city: seller?.city || undefined,
      state: seller?.state ?? undefined,
      country_code: seller?.country_code || undefined,
      postal_code: seller?.postal_code || undefined,
      tax_id: seller?.tax_id || undefined,
    },
    resolver: zodResolver(SellerEditSchema),
  });

  const { mutateAsync, isPending } = useUpdateSeller();

  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { id: seller.id, data },
      {
        onSuccess: () => {
          toast.success(t("sellers.edit.successToast", { name: data.name ?? data.email }));

          handleSuccess(`/sellers/${seller.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  });

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="overflow-y-auto">
          <div className="flex flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("sellers.fields.name")}</Form.Label>

                    <Form.Control>
                      <Input
                        placeholder={t("sellers.fields.name")}
                        {...field}
                      />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t("sellers.fields.email")}</Form.Label>

                    <Form.Control>
                      <Input
                        placeholder={t("sellers.fields.email")}
                        {...field}
                      />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="phone"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("sellers.fields.phone")}
                    </Form.Label>

                    <Form.Control>
                      <Input
                        placeholder={t("sellers.fields.phone")}
                        {...field}
                      />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("sellers.fields.description")}
                    </Form.Label>

                    <Form.Control>
                      <Textarea
                        placeholder={t("sellers.fields.description")}
                        {...field}
                      />
                    </Form.Control>

                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <div className="mt-4">
              <Heading level="h3" className="mb-4">
                {t("sellers.fields.address")}
              </Heading>

              <div className="flex flex-col gap-y-4">
                <Form.Field
                  control={form.control}
                  name="address_line"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label optional>
                          {t("sellers.fields.address_line")}
                        </Form.Label>

                        <Form.Control>
                          <Input
                            placeholder={t("sellers.fields.address_line")}
                            {...field}
                          />
                        </Form.Control>

                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label optional>
                          {t("sellers.fields.postal_code")}
                        </Form.Label>

                        <Form.Control>
                          <Input
                            placeholder={t("sellers.fields.postal_code")}
                            {...field}
                          />
                        </Form.Control>

                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="city"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label optional>
                          {t("sellers.fields.city")}
                        </Form.Label>

                        <Form.Control>
                          <Input
                            placeholder={t("sellers.fields.city")}
                            {...field}
                          />
                        </Form.Control>

                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="country_code"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label optional>
                          {t("sellers.fields.country_code")}
                        </Form.Label>

                        <Form.Control>
                          <Input
                            placeholder={t("sellers.fields.country_code")}
                            {...field}
                          />
                        </Form.Control>

                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />

                <Form.Field
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label optional>
                          {t("sellers.fields.tax_id")}
                        </Form.Label>

                        <Form.Control>
                          <Input
                            placeholder={t("sellers.fields.tax_id")}
                            {...field}
                          />
                        </Form.Control>

                        <Form.ErrorMessage />
                      </Form.Item>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </RouteDrawer.Body>

        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>

            <Button
              isLoading={isPending}
              type="submit"
              variant="primary"
              size="small"
            >
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
