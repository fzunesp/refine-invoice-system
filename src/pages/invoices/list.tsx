import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { useMany, useGetIdentity } from "@refinedev/core";

export const InvoiceList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  // Get current user info
  const { data: user } = useGetIdentity<{ role: string }>();
  const isAdmin = user?.role === "admin";

  // Get customer IDs from the invoice records
  const customerIds = tableProps?.dataSource?.map((item: any) => item.customer) || [];

  // Fetch customer data for the relationships
  const { data: customersData, isLoading: customersIsLoading } = useMany({
    resource: "customers",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="invoice_number" title="Invoice #" />
        
        <Table.Column
          dataIndex="customer"
          title="Customer"
          render={(value) => {
            if (customersIsLoading) {
              return "Loading...";
            }
            const customer = customersData?.data?.find((item) => item.id === value);
            return customer?.name || "Unknown";
          }}
        />
        
        <Table.Column
          dataIndex="invoice_date"
          title="Invoice Date"
          render={(value) => new Date(value).toLocaleDateString()}
        />
        
        <Table.Column
          dataIndex="due_date"
          title="Due Date"
          render={(value) => new Date(value).toLocaleDateString()}
        />
        
        <Table.Column
          dataIndex="amount"
          title="Amount"
          render={(value) => `$${Number(value).toFixed(2)}`}
        />
        
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => {
            const colors: Record<string, string> = {
              draft: "default",
              sent: "blue",
              paid: "green",
              overdue: "red",
            };
            return <Tag color={colors[value]}>{value.toUpperCase()}</Tag>;
          }}
        />
        
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              {/* Only show delete button to admins */}
              {isAdmin && (
                <DeleteButton hideText size="small" recordItemId={record.id} />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};