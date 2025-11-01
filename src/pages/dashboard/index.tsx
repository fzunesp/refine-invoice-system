import { useList, useMany, useGetIdentity } from "@refinedev/core";
import { Card, Col, Row, Statistic, Table, Tag, Button, Skeleton, Badge } from "antd";
import {
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<"all" | "thisMonth" | "lastMonth" | "thisYear">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Get current user info
  const { data: user } = useGetIdentity<{ email: string; role: string }>();

  // Fetch all customers
  const { data: customersData, isLoading: customersLoading } = useList({
    resource: "customers",
    pagination: { pageSize: 1000 },
    liveMode: "auto",
    queryOptions: {
      queryKey: ["customers", refreshKey],
    },
  });

  // Fetch all invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useList({
    resource: "invoices",
    pagination: { pageSize: 1000 },
    liveMode: "auto",
    queryOptions: {
      queryKey: ["invoices", refreshKey],
    },
  });

  // Filter invoices by date
  const getFilteredInvoices = () => {
    if (!invoicesData?.data) return [];
    
    const now = dayjs();
    let filtered = invoicesData.data;

    switch (dateFilter) {
      case "thisMonth":
        filtered = invoicesData.data.filter((inv: any) =>
          dayjs(inv.invoice_date).isSame(now, "month")
        );
        break;
      case "lastMonth":
        filtered = invoicesData.data.filter((inv: any) =>
          dayjs(inv.invoice_date).isSame(now.subtract(1, "month"), "month")
        );
        break;
      case "thisYear":
        filtered = invoicesData.data.filter((inv: any) =>
          dayjs(inv.invoice_date).isSame(now, "year")
        );
        break;
      default:
        filtered = invoicesData.data;
    }
    
    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();

  // Get customer IDs for recent invoices
  const recentInvoices = filteredInvoices.slice(0, 5) || [];
  const customerIds = recentInvoices.map((invoice: any) => invoice.customer);

  // Fetch customer data for recent invoices
  const { data: customersForInvoices } = useMany({
    resource: "customers",
    ids: customerIds,
    queryOptions: {
      enabled: customerIds.length > 0,
    },
  });

  // Calculate stats from filtered invoices
  const totalCustomers = customersData?.total || 0;
  const totalInvoices = filteredInvoices.length;

  const paidInvoices = filteredInvoices.filter(
    (inv: any) => inv.status === "paid"
  );
  const totalRevenue = paidInvoices.reduce(
    (sum: number, inv: any) => sum + Number(inv.amount),
    0
  );

  const unpaidInvoices = filteredInvoices.filter(
    (inv: any) => inv.status !== "paid"
  );
  const pendingAmount = unpaidInvoices.reduce(
    (sum: number, inv: any) => sum + Number(inv.amount),
    0
  );

  // Count invoices by status
  const draftCount = filteredInvoices.filter((inv: any) => inv.status === "draft").length;
  const sentCount = filteredInvoices.filter((inv: any) => inv.status === "sent").length;
  const paidCount = paidInvoices.length;
  const overdueCount = filteredInvoices.filter((inv: any) => inv.status === "overdue").length;

  // Prepare chart data - Revenue by month
  const getRevenueByMonth = () => {
    if (!invoicesData?.data) return [];

    const monthlyData: { [key: string]: number } = {};
    
    invoicesData.data.forEach((invoice: any) => {
      if (invoice.status === "paid") {
        const month = dayjs(invoice.invoice_date).format("MMM YYYY");
        monthlyData[month] = (monthlyData[month] || 0) + Number(invoice.amount);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6); // Last 6 months
  };

  const revenueChartData = getRevenueByMonth();

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle stat card clicks
  const handleCustomersClick = () => {
    navigate("/customers");
  };

  const handleInvoicesClick = () => {
    navigate("/invoices");
  };

  // Loading state
  const isLoading = customersLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton active />
        <Skeleton active style={{ marginTop: "24px" }} />
        <Skeleton active style={{ marginTop: "24px" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header with filters and actions */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <h1 style={{ margin: 0 }}>
            Dashboard{" "}
            <Badge
              count={user?.role?.toUpperCase()}
              style={{
                backgroundColor: user?.role === "admin" ? "#52c41a" : "#1890ff",
              }}
            />
          </h1>
        </Col>
        <Col>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{ marginRight: "8px" }}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
        </Col>
      </Row>

      {/* Date Filter Buttons */}
      <Row style={{ marginBottom: "24px" }}>
        <Col>
          <Button.Group>
            <Button
              type={dateFilter === "all" ? "primary" : "default"}
              onClick={() => setDateFilter("all")}
            >
              All Time
            </Button>
            <Button
              type={dateFilter === "thisMonth" ? "primary" : "default"}
              onClick={() => setDateFilter("thisMonth")}
            >
              This Month
            </Button>
            <Button
              type={dateFilter === "lastMonth" ? "primary" : "default"}
              onClick={() => setDateFilter("lastMonth")}
            >
              Last Month
            </Button>
            <Button
              type={dateFilter === "thisYear" ? "primary" : "default"}
              onClick={() => setDateFilter("thisYear")}
            >
              This Year
            </Button>
          </Button.Group>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={handleCustomersClick} style={{ cursor: "pointer" }}>
            <Statistic
              title="Total Customers"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={handleInvoicesClick} style={{ cursor: "pointer" }}>
            <Statistic
              title="Total Invoices"
              value={totalInvoices}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Amount"
              value={pendingAmount}
              prefix={<ClockCircleOutlined />}
              precision={2}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Revenue Trend (Last 6 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Invoices by Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { status: "Draft", count: draftCount },
                  { status: "Sent", count: sentCount },
                  { status: "Paid", count: paidCount },
                  { status: "Overdue", count: overdueCount },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Invoice Status Breakdown */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Invoices by Status">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Draft"
                    value={draftCount}
                    valueStyle={{ color: "#8c8c8c" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Sent"
                    value={sentCount}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Paid"
                    value={paidCount}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Overdue"
                    value={overdueCount}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Quick Stats">
            <div style={{ padding: "16px" }}>
              <p style={{ fontSize: "16px", marginBottom: "12px" }}>
                <strong>Average Invoice:</strong> ${totalInvoices > 0 ? ((totalRevenue + pendingAmount) / totalInvoices).toFixed(2) : "0.00"}
              </p>
              <p style={{ fontSize: "16px", marginBottom: "12px" }}>
                <strong>Payment Rate:</strong> {totalInvoices > 0 ? ((paidCount / totalInvoices) * 100).toFixed(1) : "0"}%
              </p>
              <p style={{ fontSize: "16px", marginBottom: "12px" }}>
                <strong>Outstanding Invoices:</strong> {unpaidInvoices.length}
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Invoices */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Recent Invoices">
            <Table
              dataSource={recentInvoices}
              rowKey="id"
              pagination={false}
              size="small"
            >
              <Table.Column
                dataIndex="invoice_number"
                title="Invoice #"
                width={120}
              />
              <Table.Column
                dataIndex="customer"
                title="Customer"
                render={(customerId) => {
                  const customer = customersForInvoices?.data?.find(
                    (c: any) => c.id === customerId
                  );
                  return customer?.name || "Unknown";
                }}
              />
              <Table.Column
                dataIndex="invoice_date"
                title="Date"
                render={(date) => new Date(date).toLocaleDateString()}
                width={120}
              />
              <Table.Column
                dataIndex="amount"
                title="Amount"
                render={(amount) => `$${Number(amount).toFixed(2)}`}
                width={120}
              />
              <Table.Column
                dataIndex="status"
                title="Status"
                width={100}
                render={(status) => {
                  const colors: Record<string, string> = {
                    draft: "default",
                    sent: "blue",
                    paid: "green",
                    overdue: "red",
                  };
                  return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
                }}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};