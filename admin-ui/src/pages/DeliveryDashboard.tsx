import { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Modal,
  Descriptions,
  Steps,
  Upload,
  Form,
  Input,
  Row,
  Col,
  Statistic,
  Badge,
  Empty,
  Image,
  message,
  Select,
} from 'antd';
import {
  CarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  InboxOutlined,
  CameraOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMyDeliveries, useDelivery, useUpdateDeliveryStatus, useUploadProof, useAdminDeliveryStats, useDriverStats } from '../hooks/useDeliveries';
import type { Delivery, DeliveryStatus } from '../services/delivery.service';
import dayjs from 'dayjs';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const statusColors: Record<DeliveryStatus, string> = {
  preparing: 'blue',
  in_transit: 'cyan',
  out_for_delivery: 'orange',
  delivered: 'green',
  failed: 'red',
};

const statusLabels: Record<DeliveryStatus, string> = {
  preparing: 'Preparing',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
};

const statusSteps: Record<DeliveryStatus, number> = {
  preparing: 0,
  in_transit: 1,
  out_for_delivery: 2,
  delivered: 3,
  failed: -1,
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusForm] = Form.useForm();
  const [proofForm] = Form.useForm();

  const { data: adminStats, isLoading: adminStatsLoading, refetch: refetchAdminStats } = useAdminDeliveryStats();
  const { data: driverStats, isLoading: driverStatsLoading, refetch: refetchDriverStats } = useDriverStats();
  const { data, isLoading, refetch } = useMyDeliveries({});
  const { data: selectedDelivery, isLoading: deliveryLoading } = useDelivery(selectedDeliveryId || '');
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateDeliveryStatus();
  const { mutate: uploadProof, isPending: isUploadingProof } = useUploadProof();

  const statsLoading = isAdmin ? adminStatsLoading : driverStatsLoading;
  const handleRefresh = () => {
    if (isAdmin) {
      refetchAdminStats();
    } else {
      refetchDriverStats();
    }
    refetch();
  };

  const handleViewDelivery = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
  };

  const handleUpdateStatus = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setStatusModalOpen(true);
  };

  const handleUploadProof = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setProofModalOpen(true);
  };

  const handleStatusSubmit = (values: any) => {
    if (!selectedDeliveryId) return;

    updateStatus(
      {
        id: selectedDeliveryId,
        data: {
          status: values.status,
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

  const handleProofSubmit = (values: any) => {
    if (!selectedDeliveryId) return;

    uploadProof(
      {
        id: selectedDeliveryId,
        data: {
          image: selectedImage || undefined,
          notes: values.notes,
        },
      },
      {
        onSuccess: () => {
          setProofModalOpen(false);
          proofForm.resetFields();
          setSelectedImage(null);
          setImagePreview(null);
        },
      }
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const columns: ColumnsType<Delivery> = [
    {
      title: 'Order',
      key: 'order',
      width: 180,
      render: (_: any, record: Delivery) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.orderNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.createdAt).format('MMM D, h:mm A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_: any, record: Delivery) => {
        const { deliveryAddress } = record;
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {deliveryAddress.firstName} {deliveryAddress.lastName}
            </Text>
            <Space size={4}>
              <PhoneOutlined style={{ fontSize: 12, color: '#999' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {deliveryAddress.phone}
              </Text>
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Delivery Address',
      key: 'address',
      render: (_: any, record: Delivery) => {
        const { deliveryAddress } = record;
        return (
          <Space direction="vertical" size={0}>
            <Text>{deliveryAddress.addressLine1}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {deliveryAddress.city}, {deliveryAddress.state}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      align: 'center',
      render: (items: Delivery['items']) => (
        <Badge count={items.length} showZero color="blue" />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: DeliveryStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Delivery) => (
        <Space size="small" wrap>
          <Button
            type="text"
            size="small"
            icon={<EnvironmentOutlined />}
            onClick={() => handleViewDelivery(record.id)}
          >
            View
          </Button>
          {record.status !== 'delivered' && record.status !== 'failed' && (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleUpdateStatus(record.id)}
            >
              Update
            </Button>
          )}
          {record.status === 'out_for_delivery' && !record.proofOfDelivery && (
            <Button
              type="primary"
              size="small"
              icon={<CameraOutlined />}
              onClick={() => handleUploadProof(record.id)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Deliver
            </Button>
          )}
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
            {isAdmin ? 'Delivery Management' : 'My Deliveries'}
          </Title>
          <Text type="secondary">
            {isAdmin
              ? 'Monitor and manage all delivery operations'
              : 'Manage your assigned delivery orders'}
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={isLoading || statsLoading}
          size="large"
        >
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {isAdmin ? (
        // Admin Stats
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Total Shipments"
                  value={adminStats?.overview.totalShipments || 0}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Active Deliveries"
                  value={adminStats?.overview.activeDeliveries || 0}
                  prefix={<RocketOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Unassigned"
                  value={adminStats?.overview.unassigned || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Failed Rate"
                  value={adminStats?.overview.failedRate || 0}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                  loading={adminStatsLoading}
                  precision={1}
                />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Today's Deliveries"
                  value={adminStats?.period.todayDeliveries || 0}
                  valueStyle={{ color: '#52c41a' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Week Deliveries"
                  value={adminStats?.period.weekDeliveries || 0}
                  valueStyle={{ color: '#1890ff' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Month Deliveries"
                  value={adminStats?.period.monthDeliveries || 0}
                  valueStyle={{ color: '#722ed1' }}
                  loading={adminStatsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm rounded-xl">
                <Statistic
                  title="Avg Delivery Time"
                  value={adminStats?.overview.avgDeliveryTimeHours || 0}
                  suffix="hrs"
                  valueStyle={{ color: '#13c2c2' }}
                  loading={adminStatsLoading}
                  precision={1}
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        // Driver Stats
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Total Assigned"
                value={driverStats?.totalAssigned || 0}
                prefix={<CarOutlined />}
                valueStyle={{ color: '#1890ff' }}
                loading={driverStatsLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Completed"
                value={driverStats?.completed || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                loading={driverStatsLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Active"
                value={driverStats?.active || 0}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#13c2c2' }}
                loading={driverStatsLoading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-xl">
              <Statistic
                title="Success Rate"
                value={driverStats?.successRate || 0}
                suffix="%"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                loading={driverStatsLoading}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Deliveries Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
            showTotal: (total) => `${total} deliveries`,
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No deliveries assigned"
              />
            ),
          }}
        />
      </Card>

      {/* Delivery Detail Modal */}
      <Modal
        title={
          <Space>
            <CarOutlined />
            <span>Delivery Details - {selectedDelivery?.orderNumber}</span>
          </Space>
        }
        open={!!selectedDeliveryId && !statusModalOpen && !proofModalOpen}
        onCancel={() => setSelectedDeliveryId(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectedDeliveryId(null)}>
            Close
          </Button>,
          selectedDelivery?.status !== 'delivered' && selectedDelivery?.status !== 'failed' && (
            <Button
              key="update"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                if (selectedDelivery) {
                  handleUpdateStatus(selectedDelivery.id);
                }
              }}
              style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}
            >
              Update Status
            </Button>
          ),
        ]}
      >
        {deliveryLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : selectedDelivery ? (
          <div className="space-y-6">
            {/* Status Progress */}
            <Steps
              current={statusSteps[selectedDelivery.status]}
              status={selectedDelivery.status === 'failed' ? 'error' : undefined}
              items={[
                { title: 'Preparing', icon: <InboxOutlined /> },
                { title: 'In Transit', icon: <RocketOutlined /> },
                { title: 'Out for Delivery', icon: <CarOutlined /> },
                { title: 'Delivered', icon: <CheckCircleOutlined /> },
              ]}
            />

            {/* Customer & Delivery Info */}
            <Descriptions title="Delivery Information" bordered column={2} size="small">
              <Descriptions.Item label="Customer" span={2}>
                {selectedDelivery.deliveryAddress.firstName}{' '}
                {selectedDelivery.deliveryAddress.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={2}>
                <PhoneOutlined /> {selectedDelivery.deliveryAddress.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <EnvironmentOutlined /> {selectedDelivery.deliveryAddress.addressLine1}
                {selectedDelivery.deliveryAddress.addressLine2 && (
                  <>, {selectedDelivery.deliveryAddress.addressLine2}</>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {selectedDelivery.deliveryAddress.city}
              </Descriptions.Item>
              <Descriptions.Item label="State/Region">
                {selectedDelivery.deliveryAddress.state}
              </Descriptions.Item>
            </Descriptions>

            {/* Order Items */}
            <div>
              <Title level={5}>Items to Deliver</Title>
              <div className="space-y-2">
                {selectedDelivery.items.map((item) => (
                  <Card key={item.id} size="small">
                    <Row gutter={16} align="middle">
                      <Col span={3}>
                        {item.productImage ? (
                          <Image
                            src={`${API_CONFIG.BASE_URL}${item.productImage}`}
                            alt={item.productName}
                            width={50}
                            height={50}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              background: '#f0f0f0',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <InboxOutlined style={{ fontSize: 20, color: '#999' }} />
                          </div>
                        )}
                      </Col>
                      <Col span={15}>
                        <Text strong>{item.productName}</Text>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Text type="secondary">Qty: {item.quantity}</Text>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </div>

            {/* Proof of Delivery */}
            {selectedDelivery.proofOfDelivery && (
              <>
                <Title level={5}>Proof of Delivery</Title>
                <Descriptions bordered column={1} size="small">
                  {selectedDelivery.proofOfDelivery.imageUrl && (
                    <Descriptions.Item label="Photo">
                      <Image
                        src={`${API_CONFIG.BASE_URL}${selectedDelivery.proofOfDelivery.imageUrl}`}
                        alt="Proof of delivery"
                        width={200}
                      />
                    </Descriptions.Item>
                  )}
                  {selectedDelivery.proofOfDelivery.notes && (
                    <Descriptions.Item label="Notes">
                      {selectedDelivery.proofOfDelivery.notes}
                    </Descriptions.Item>
                  )}
                  {selectedDelivery.proofOfDelivery.deliveredAt && (
                    <Descriptions.Item label="Delivered At">
                      {dayjs(selectedDelivery.proofOfDelivery.deliveredAt).format(
                        'MMM D, YYYY h:mm A'
                      )}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Delivery Status"
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
          initialValues={{ status: selectedDelivery?.status }}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select size="large">
              <Select.Option value="preparing">Preparing</Select.Option>
              <Select.Option value="in_transit">In Transit</Select.Option>
              <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
              <Select.Option value="delivered">Delivered</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes about this status update" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Proof Modal */}
      <Modal
        title="Upload Proof of Delivery"
        open={proofModalOpen}
        onCancel={() => {
          setProofModalOpen(false);
          proofForm.resetFields();
          setSelectedImage(null);
          setImagePreview(null);
        }}
        onOk={() => proofForm.submit()}
        confirmLoading={isUploadingProof}
        okText="Mark as Delivered"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        <Form form={proofForm} layout="vertical" onFinish={handleProofSubmit}>
          <Form.Item label="Photo">
            <Dragger
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={(file) => {
                if (file.size > 5 * 1024 * 1024) {
                  message.error('Image must be smaller than 5MB');
                  return false;
                }
                setSelectedImage(file);
                const reader = new FileReader();
                reader.onload = (e) => {
                  setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              ) : (
                <div className="py-8">
                  <p className="ant-upload-drag-icon">
                    <CameraOutlined style={{ fontSize: 48 }} />
                  </p>
                  <p className="ant-upload-text">Click or drag photo to upload</p>
                  <p className="ant-upload-hint">Take a photo of the delivered package</p>
                </div>
              )}
            </Dragger>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Delivery Notes"
            rules={[{ required: true, message: 'Please add delivery notes' }]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., Package left at front door, Received by customer, etc."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
