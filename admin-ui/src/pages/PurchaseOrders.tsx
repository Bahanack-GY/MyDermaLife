import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Select, Card, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdAdd, MdVisibility } from 'react-icons/md';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import type { PurchaseOrder, PurchaseOrderStatus } from '../services/purchaseOrder.service';

const { Text } = Typography;

const statusColors: Record<PurchaseOrderStatus, string> = {
  draft: 'default',
  submitted: 'blue',
  confirmed: 'cyan',
  partially_received: 'orange',
  received: 'green',
  cancelled: 'red',
};

const statusLabels: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  partially_received: 'Partially Received',
  received: 'Received',
  cancelled: 'Cancelled',
};

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<PurchaseOrderStatus>();

  const { data, isLoading } = usePurchaseOrders({ page, limit, status });

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
    },
    {
      title: 'Supplier',
      key: 'supplier',
      render: (_, record) => record.supplier?.name || '-',
    },
    {
      title: 'Warehouse',
      key: 'warehouse',
      render: (_, record) => record.warehouse?.name || '-',
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (_, record) => (
        <Text strong>
          {record.totalAmount.toLocaleString()} {record.currency}
        </Text>
      ),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={statusColors[record.status]}>{statusLabels[record.status]}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<MdVisibility />}
          onClick={() => navigate(`/purchase-orders/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
          <Button
            type="primary"
            icon={<MdAdd />}
            onClick={() => navigate('/purchase-orders/create')}
            size="large"
          >
            Create Purchase Order
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            allowClear
            onChange={setStatus}
          >
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="submitted">Submitted</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="partially_received">Partially Received</Select.Option>
            <Select.Option value="received">Received</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            onChange: setPage,
            showTotal: (total) => `Total ${total} purchase orders`,
          }}
        />
      </Card>
    </div>
  );
}
