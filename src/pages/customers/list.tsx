import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space } from "antd";
import { useGetIdentity } from "@refinedev/core";

export const CustomerList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  // Get current user info
  const { data: user } = useGetIdentity<{ role: string }>();
  const isAdmin = user?.role === "admin";

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="phone" title="Phone" />
        <Table.Column dataIndex="company" title="Company" />
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