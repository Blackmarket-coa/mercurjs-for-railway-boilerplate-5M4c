import { useState } from "react";

import { Button, Container, Drawer, Heading, Text } from "@medusajs/ui";

import type { AdminCommissionAggregate } from "@custom-types/commission";

import { _DataTable } from "@components/table/data-table";

import {
  useCommissionRules,
  useDefaultCommissionRule,
} from "@hooks/api/commission";
import { useCommissionRulesTableColumns } from "@hooks/table/columns/use-commission-rules-table-columns";
import { useCommissionRulesTableQuery } from "@hooks/table/query/use-commission-rules-table-query";
import { useDataTable } from "@hooks/use-data-table";

import { CommissionDetailTable } from "@routes/commission/components/commission-detail-table";
import CreateCommissionRuleForm from "@routes/commission/components/create-commission-rule-form";
import UpsertDefaultCommissionRuleForm from "@routes/commission/components/upsert-default-commission-rule";

const PAGE_SIZE = 50;

export const Commission = () => {
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [upsertDefaultOpen, setUpsertDefaultOpen] = useState(false);
  const defaultRule = useDefaultCommissionRule();
  const { searchParams, raw } = useCommissionRulesTableQuery({
    pageSize: PAGE_SIZE,
  });
  const {
    commission_rules,
    count,
    isPending: isLoading,
    refetch,
  } = useCommissionRules({
    ...(searchParams as Record<string, string | number>),
  });

  const columns = useCommissionRulesTableColumns({
    onSuccess() {
      refetch();
    },
  });

  const { table } = useDataTable({
    data: (commission_rules ?? []) as AdminCommissionAggregate[],
    columns,
    enablePagination: true,
    getRowId: (row) => row.id!,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Global Commission Settings</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Manage global commission settings for your marketplace.
            </Text>
          </div>

          <Drawer
            open={upsertDefaultOpen}
            onOpenChange={(openChanged) => setUpsertDefaultOpen(openChanged)}
          >
            <Drawer.Trigger
              onClick={() => {
                setUpsertDefaultOpen(true);
              }}
              asChild
            >
              <Button variant="secondary">Edit</Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Edit default rule</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <UpsertDefaultCommissionRuleForm
                  onSuccess={() => {
                    setUpsertDefaultOpen(false);
                    defaultRule.refetch();
                  }}
                  rule={defaultRule.commission_rule}
                />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer>
        </div>

        <CommissionDetailTable commissionRule={defaultRule.commission_rule} />
      </Container>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Commission Rules</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              View, search, and manage existing commission rules.
            </Text>
          </div>
          <Drawer
            open={createRuleOpen}
            onOpenChange={(openChanged) => setCreateRuleOpen(openChanged)}
          >
            <Drawer.Trigger
              onClick={() => {
                setCreateRuleOpen(true);
              }}
              asChild
            >
              <Button variant="secondary">Create</Button>
            </Drawer.Trigger>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>Create Rule</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <CreateCommissionRuleForm
                  onSuccess={() => {
                    setCreateRuleOpen(false);
                    refetch();
                  }}
                />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer>
        </div>

        <_DataTable
          table={table}
          count={count}
          columns={columns}
          pageSize={PAGE_SIZE}
          isLoading={isLoading}
          filters={[]}
          pagination
          queryObject={raw}
          noRecords={{
            title: "Commission rules",
            message: "No records",
          }}
        />
      </Container>
    </>
  );
};
