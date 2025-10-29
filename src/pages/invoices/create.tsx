import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, InputNumber } from "antd";
import dayjs from "dayjs";

export const InvoiceCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    defaultFormValues: {
      status: "draft",
      invoice_date: dayjs().format("YYYY-MM-DD"),
      due_date: dayjs().add(30, "day").format("YYYY-MM-DD"), // 30 days from today
    },
  });

  // Fetch customers for dropdown
  const { selectProps: customerSelectProps } = useSelect({
    resource: "customers",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        
        <Form.Item
          label="Invoice Number"
          name="invoice_number"
          rules={[
            {
              required: true,
              message: "Please enter invoice number",
            },
          ]}
        >
          <Input placeholder="e.g., INV-001" />
        </Form.Item>

        <Form.Item
          label="Customer"
          name="customer"
          rules={[
            {
              required: true,
              message: "Please select a customer",
            },
          ]}
        >
          <Select
            {...customerSelectProps}
            placeholder="Select a customer"
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Invoice Date"
          name="invoice_date"
          rules={[
            {
              required: true,
              message: "Please select invoice date",
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Due Date"
          name="due_date"
          rules={[
            {
              required: true,
              message: "Please select due date",
            },
          ]}
          getValueProps={(value) => ({
            value: value ? dayjs(value) : undefined,
          })}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[
            {
              required: true,
              message: "Please select status",
            },
          ]}
          initialValue="draft"
        >
          <Select placeholder="Select status">
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="sent">Sent</Select.Option>
            <Select.Option value="paid">Paid</Select.Option>
            <Select.Option value="overdue">Overdue</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            {
              required: true,
              message: "Please enter amount",
            },
            {
              type: "number",
              min: 0,
              message: "Amount must be positive",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            prefix="$"
            min={0}
            precision={2}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={4} placeholder="Add any notes or description..." />
        </Form.Item>
      </Form>
    </Create>
  );
};