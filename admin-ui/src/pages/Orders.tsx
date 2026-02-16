import { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Input,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  Row,
  Col,
  Divider,
  Form,
  Statistic,
  Image,
  Empty,
  Badge,
} from 'antd';
import {
  ShoppingOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useOrders, useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import type { Order, OrderStatus } from '../services/order.service';
import dayjs from 'dayjs';
import { API_CONFIG } from '../config/api.config';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const statusColors: Record<OrderStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  processing: 'cyan',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'volcano',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function Orders() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusForm] = Form.useForm();

  const { data, isLoading, refetch } = useOrders({
    page,
    limit,
    status,
    search: search || undefined,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
  });

  const { data: selectedOrder, isLoading: orderLoading } = useOrder(selectedOrderId || '');
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleUpdateStatus = (orderId: string, currentStatus: OrderStatus) => {
    setSelectedOrderId(orderId);
    setStatusModalOpen(true);
    statusForm.setFieldsValue({ status: currentStatus });
  };

  const handleStatusSubmit = (values: any) => {
    if (!selectedOrderId) return;

    updateStatus(
      {
        id: selectedOrderId,
        data: {
          status: values.status,
          cancellationReason: values.cancellationReason,
          notes: values.notes,
        },
      },
      {
        onSuccess: () => {
          setStatusModalOpen(false);
          statusForm.resetFields();
        },
      }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setDateRange(null);
    setPage(1);
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
      render: (orderNumber: string, record: Order) => (
        <Space direction="vertical" size={0}>
          <Text strong>{orderNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.createdAt).format('MMM D, YYYY h:mm A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_: any, record: Order) => {
        const { shippingAddress } = record;
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {shippingAddress.phone}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      align: 'center',
      render: (items: Order['items']) => (
        <Badge count={items.length} showZero color="blue" />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (totalAmount: number, record: Order) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#52c41a' }}>
            {formatPrice(totalAmount)}
          </Text>
          {record.subtotal !== totalAmount && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Subtotal: {formatPrice(record.subtotal)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]} style={{ fontSize: 13 }}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 120,
      render: (paymentStatus: string) => {
        const color = paymentStatus === 'paid' ? 'success' : paymentStatus === 'failed' ? 'error' : 'warning';
        return <Tag color={color}>{paymentStatus}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(record.id)}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(record.id, record.status)}
          >
            Status
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="font-serif !mb-1">
            Orders
          </Title>
          <Text type="secondary">
            Manage product orders and shipping
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm rounded-xl">
        <Space direction="vertical" size="large" className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by order #, customer name, phone..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Filter by status"
                value={status}
                onChange={setStatus}
                size="large"
                className="w-full"
                allowClear
              >
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
                <Option value="refunded">Refunded</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <RangePicker
                size="large"
                className="w-full"
                value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([
                      dates[0]!.toISOString(),
                      dates[1]!.toISOString(),
                    ]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
            </Col>
          </Row>
          {(search || status || dateRange) && (
            <Button type="link" onClick={clearFilters} className="p-0">
              Clear all filters
            </Button>
          )}
        </Space>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            onChange: (newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            },
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No orders found"
              />
            ),
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Order Details - {selectedOrder?.orderNumber}</span>
          </Space>
        }
        open={!!selectedOrderId && !statusModalOpen}
        onCancel={() => setSelectedOrderId(null)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setSelectedOrderId(null)}>
            Close
          </Button>,
          <Button
            key="update"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (selectedOrder) {
                handleUpdateStatus(selectedOrder.id, selectedOrder.status);
              }
            }}
            style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}
          >
            Update Status
          </Button>,
        ]}
      >
        {orderLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : selectedOrder ? (
          <div className="space-y-6">
            {/* Status & Payment */}
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Order Status"
                  value={statusLabels[selectedOrder.status]}
                  prefix={<Tag color={statusColors[selectedOrder.status]} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Payment Status"
                  value={selectedOrder.paymentStatus}
                  valueStyle={{ textTransform: 'capitalize' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Amount"
                  value={formatPrice(selectedOrder.totalAmount)}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>

            <Divider />

            {/* Customer & Shipping */}
            <Descriptions title="Shipping Information" bordered column={2} size="small">
              <Descriptions.Item label="Customer Name" span={2}>
                <UserOutlined /> {selectedOrder.shippingAddress.firstName}{' '}
                {selectedOrder.shippingAddress.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={2}>
                {selectedOrder.shippingAddress.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <EnvironmentOutlined /> {selectedOrder.shippingAddress.addressLine1}
                {selectedOrder.shippingAddress.addressLine2 && (
                  <>, {selectedOrder.shippingAddress.addressLine2}</>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {selectedOrder.shippingAddress.city}
              </Descriptions.Item>
              <Descriptions.Item label="State/Region">
                {selectedOrder.shippingAddress.state}
              </Descriptions.Item>
              <Descriptions.Item label="Country" span={2}>
                {selectedOrder.shippingAddress.country}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Order Items */}
            <div>
              <Title level={5}>Order Items</Title>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <Card key={item.id} size="small">
                    <Row gutter={16} align="middle">
                      <Col span={3}>
                        {item.productImage ? (
                          <Image
                            src={`${API_CONFIG.BASE_URL}${item.productImage}`}
                            alt={item.productName}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              background: '#f0f0f0',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ShoppingOutlined style={{ fontSize: 24, color: '#999' }} />
                          </div>
                        )}
                      </Col>
                      <Col span={12}>
                        <Text strong>{item.productName}</Text>
                      </Col>
                      <Col span={3}>
                        <Text type="secondary">Qty: {item.quantity}</Text>
                      </Col>
                      <Col span={3}>
                        <Text>{formatPrice(item.unitPrice)}</Text>
                      </Col>
                      <Col span={3}>
                        <Text strong>{formatPrice(item.totalPrice)}</Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </div>

            <Divider />

            {/* Order Summary */}
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Subtotal">
                {formatPrice(selectedOrder.subtotal)}
              </Descriptions.Item>
              {selectedOrder.discountAmount > 0 && (
                <Descriptions.Item label="Discount">
                  -{formatPrice(selectedOrder.discountAmount)}
                </Descriptions.Item>
              )}
              {selectedOrder.shippingCost > 0 && (
                <Descriptions.Item label="Shipping">
                  {formatPrice(selectedOrder.shippingCost)}
                </Descriptions.Item>
              )}
              {selectedOrder.taxAmount > 0 && (
                <Descriptions.Item label="Tax">
                  {formatPrice(selectedOrder.taxAmount)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total">
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  {formatPrice(selectedOrder.totalAmount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.notes && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Notes</Title>
                  <Text>{selectedOrder.notes}</Text>
                </div>
              </>
            )}

            <Divider />

            {/* Timestamps */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Created At">
                <CalendarOutlined /> {dayjs(selectedOrder.createdAt).format('MMM D, YYYY h:mm A')}
              </Descriptions.Item>
              {selectedOrder.shippedAt && (
                <Descriptions.Item label="Shipped At">
                  {dayjs(selectedOrder.shippedAt).format('MMM D, YYYY h:mm A')}
                </Descriptions.Item>
              )}
              {selectedOrder.deliveredAt && (
                <Descriptions.Item label="Delivered At">
                  {dayjs(selectedOrder.deliveredAt).format('MMM D, YYYY h:mm A')}
                </Descriptions.Item>
              )}
              {selectedOrder.cancelledAt && (
                <Descriptions.Item label="Cancelled At" span={2}>
                  {dayjs(selectedOrder.cancelledAt).format('MMM D, YYYY h:mm A')}
                  {selectedOrder.cancellationReason && (
                    <div>
                      <Text type="secondary">Reason: {selectedOrder.cancellationReason}</Text>
                    </div>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        ) : null}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalOpen}
        onCancel={() => {
          setStatusModalOpen(false);
          statusForm.resetFields();
        }}
        onOk={() => statusForm.submit()}
        confirmLoading={isUpdatingStatus}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleStatusSubmit}
        >
          <Form.Item
            name="status"
            label="Order Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select size="large">
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.status !== currentValues.status
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('status') === 'cancelled' ? (
                <Form.Item
                  name="cancellationReason"
                  label="Cancellation Reason"
                  rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                  <TextArea rows={3} placeholder="Why is this order being cancelled?" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="notes" label="Admin Notes">
            <TextArea rows={3} placeholder="Optional notes about this status change" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
