import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Descriptions,
  Table,
  Tag,
  Modal,
  Form,
  InputNumber,
  Typography,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdArrowBack } from 'react-icons/md';
import {
  usePurchaseOrder,
  useSubmitPurchaseOrder,
  useConfirmPurchaseOrder,
  useReceivePurchaseOrder,
  useCancelPurchaseOrder,
} from '../hooks/usePurchaseOrders';
import type { PurchaseOrderItem, PurchaseOrderStatus } from '../services/purchaseOrder.service';

const { Text, Title } = Typography;

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

export default function PurchaseOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: po, isLoading } = usePurchaseOrder(id || '');
  const submitPO = useSubmitPurchaseOrder();
  const confirmPO = useConfirmPurchaseOrder();
  const receivePO = useReceivePurchaseOrder();
  const cancelPO = useCancelPurchaseOrder();

  const handleSubmit = () => {
    Modal.confirm({
      title: 'Submit Purchase Order',
      content: 'Are you sure you want to submit this purchase order?',
      onOk: () => id && submitPO.mutate(id),
    });
  };

  const handleConfirm = () => {
    Modal.confirm({
      title: 'Confirm Purchase Order',
      content: 'Are you sure you want to confirm this purchase order?',
      onOk: () => id && confirmPO.mutate(id),
    });
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Cancel Purchase Order',
      content: 'Are you sure you want to cancel this purchase order? This action cannot be undone.',
      okText: 'Cancel Order',
      okType: 'danger',
      onOk: () => id && cancelPO.mutate(id),
    });
  };

  const handleReceive = () => {
    form.resetFields();
    po?.items?.forEach((item) => {
      form.setFieldValue(
        `item_${item.id}`,
        item.quantityOrdered - item.quantityReceived
      );
    });
    setIsReceiveModalOpen(true);
  };

  const handleReceiveSubmit = async (values: any) => {
    if (!id || !po) return;

    const items = po.items
      ?.map((item) => ({
        purchaseOrderItemId: item.id,
        quantityReceived: values[`item_${item.id}`] || 0,
      }))
      .filter((item) => item.quantityReceived > 0);

    if (!items || items.length === 0) return;

    try {
      await receivePO.mutateAsync({ id, data: { items } });
      setIsReceiveModalOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<PurchaseOrderItem> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div>{record.product?.name}</div>
          <Text type="secondary" className="text-sm">
            SKU: {record.product?.sku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Quantity Ordered',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
    },
    {
      title: 'Quantity Received',
      dataIndex: 'quantityReceived',
      key: 'quantityReceived',
      render: (received, record) => (
        <div>
          <Text>{received}</Text>
          {received < record.quantityOrdered && (
            <Tag color="orange" className="ml-2">
              Pending: {record.quantityOrdered - received}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost) => `${cost.toLocaleString()} ${po?.currency}`,
    },
    {
      title: 'Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => (
        <Text strong>
          {cost.toLocaleString()} {po?.currency}
        </Text>
      ),
    },
  ];

  if (isLoading || !po) {
    return (
      <div className="p-6">
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button
            icon={<MdArrowBack />}
            onClick={() => navigate('/purchase-orders')}
            className="mb-4"
          >
            Back to Purchase Orders
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <Title level={2} className="mb-2">
                {po.orderNumber}
              </Title>
              <Tag color={statusColors[po.status]} className="text-sm">
                {statusLabels[po.status]}
              </Tag>
            </div>
            <Space>
              {po.status === 'draft' && (
                <>
                  <Button type="primary" onClick={handleSubmit} loading={submitPO.isPending}>
                    Submit Order
                  </Button>
                  <Button danger onClick={handleCancel} loading={cancelPO.isPending}>
                    Cancel
                  </Button>
                </>
              )}
              {po.status === 'submitted' && (
                <>
                  <Button type="primary" onClick={handleConfirm} loading={confirmPO.isPending}>
                    Confirm Order
                  </Button>
                  <Button danger onClick={handleCancel} loading={cancelPO.isPending}>
                    Cancel
                  </Button>
                </>
              )}
              {(po.status === 'confirmed' || po.status === 'partially_received') && (
                <>
                  <Button type="primary" onClick={handleReceive}>
                    Receive Items
                  </Button>
                  <Button danger onClick={handleCancel} loading={cancelPO.isPending}>
                    Cancel
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>

        <Row gutter={16} className="mb-6">
          <Col xs={24} md={12}>
            <Card title="Order Information" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Supplier">{po.supplier?.name}</Descriptions.Item>
                <Descriptions.Item label="Warehouse">{po.warehouse?.name}</Descriptions.Item>
                <Descriptions.Item label="Expected Delivery">
                  {po.expectedDeliveryDate
                    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(po.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Financial Summary" size="small">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Subtotal:</Text>
                  <Text>
                    {po.subtotal.toLocaleString()} {po.currency}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Tax:</Text>
                  <Text>
                    {po.taxAmount.toLocaleString()} {po.currency}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Shipping:</Text>
                  <Text>
                    {po.shippingCost.toLocaleString()} {po.currency}
                  </Text>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Text strong>Total:</Text>
                  <Text strong className="text-lg">
                    {po.totalAmount.toLocaleString()} {po.currency}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {po.notes && (
          <Card title="Notes" size="small" className="mb-6">
            <Text>{po.notes}</Text>
          </Card>
        )}

        <Card title="Order Items" size="small">
          <Table
            columns={columns}
            dataSource={po.items}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>

      <Modal
        title="Receive Purchase Order Items"
        open={isReceiveModalOpen}
        onCancel={() => setIsReceiveModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleReceiveSubmit}>
          {po.items?.map((item) => (
            <Form.Item
              key={item.id}
              label={
                <div>
                  <div>{item.product?.name}</div>
                  <Text type="secondary" className="text-sm">
                    Ordered: {item.quantityOrdered} | Received: {item.quantityReceived} | Pending:{' '}
                    {item.quantityOrdered - item.quantityReceived}
                  </Text>
                </div>
              }
              name={`item_${item.id}`}
              rules={[
                {
                  validator: (_, value) => {
                    const pending = item.quantityOrdered - item.quantityReceived;
                    if (value > pending) {
                      return Promise.reject(
                        `Cannot receive more than pending quantity (${pending})`
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={0}
                max={item.quantityOrdered - item.quantityReceived}
                style={{ width: '100%' }}
                placeholder="Quantity to receive"
              />
            </Form.Item>
          ))}

          <Form.Item className="mb-0 mt-6">
            <Space>
              <Button onClick={() => setIsReceiveModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={receivePO.isPending}>
                Receive Items
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
