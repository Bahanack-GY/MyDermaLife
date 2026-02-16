import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  Card,
  Modal,
  Form,
  InputNumber,
  Input,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdSwapHoriz, MdEdit } from 'react-icons/md';
import { useStock, useAdjustStock, useTransferStock } from '../hooks/useInventory';
import { useWarehouses } from '../hooks/useWarehouses';
import type { Stock } from '../services/inventory.service';

type ModalType = 'adjust' | 'transfer' | null;

export default function Inventory() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [warehouseId, setWarehouseId] = useState<string>();
  const [lowStock, setLowStock] = useState<boolean>();
  const [outOfStock, setOutOfStock] = useState<boolean>();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useStock({ page, limit, warehouseId, lowStock, outOfStock });
  const { data: warehousesData } = useWarehouses({ limit: 1000, isActive: true });
  const adjustStock = useAdjustStock();
  const transferStock = useTransferStock();

  const handleAdjust = (stock: Stock) => {
    setSelectedStock(stock);
    setModalType('adjust');
    form.resetFields();
  };

  const handleTransfer = (stock: Stock) => {
    setSelectedStock(stock);
    setModalType('transfer');
    form.resetFields();
    form.setFieldValue('sourceWarehouseId', stock.warehouseId);
    form.setFieldValue('productId', stock.productId);
  };

  const handleModalClose = () => {
    setModalType(null);
    setSelectedStock(null);
    form.resetFields();
  };

  const handleAdjustSubmit = async (values: any) => {
    if (!selectedStock) return;

    try {
      await adjustStock.mutateAsync({
        warehouseId: selectedStock.warehouseId,
        productId: selectedStock.productId,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes,
      });
      handleModalClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTransferSubmit = async (values: any) => {
    try {
      await transferStock.mutateAsync(values);
      handleModalClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<Stock> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product?.name}</div>
          <div className="text-sm text-gray-500">SKU: {record.product?.sku}</div>
        </div>
      ),
    },
    {
      title: 'Warehouse',
      key: 'warehouse',
      render: (_, record) => record.warehouse?.name || '-',
    },
    {
      title: 'Available',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      render: (qty, record) => {
        const isLowStock = qty <= record.lowStockThreshold && qty > 0;
        const isOutOfStock = qty === 0;
        return (
          <Space>
            <span className={isOutOfStock ? 'text-red-600 font-bold' : isLowStock ? 'text-orange-600' : ''}>
              {qty}
            </span>
            {isOutOfStock && <Tag color="red">Out of Stock</Tag>}
            {isLowStock && <Tag color="orange">Low Stock</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Reserved',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
    },
    {
      title: 'Total',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <span className="font-medium">{qty}</span>,
    },
    {
      title: 'Low Stock Threshold',
      dataIndex: 'lowStockThreshold',
      key: 'lowStockThreshold',
    },
    {
      title: 'Last Restocked',
      dataIndex: 'lastRestockedAt',
      key: 'lastRestockedAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<MdEdit />} onClick={() => handleAdjust(record)}>
            Adjust
          </Button>
          <Button type="link" icon={<MdSwapHoriz />} onClick={() => handleTransfer(record)}>
            Transfer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <Select
            placeholder="Filter by Warehouse"
            style={{ width: 250 }}
            allowClear
            onChange={setWarehouseId}
          >
            {warehousesData?.data.map((warehouse) => (
              <Select.Option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>

          <Select placeholder="Stock Status" style={{ width: 200 }} allowClear onChange={(val) => {
            if (val === 'low') {
              setLowStock(true);
              setOutOfStock(undefined);
            } else if (val === 'out') {
              setOutOfStock(true);
              setLowStock(undefined);
            } else {
              setLowStock(undefined);
              setOutOfStock(undefined);
            }
          }}>
            <Select.Option value="low">Low Stock</Select.Option>
            <Select.Option value="out">Out of Stock</Select.Option>
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
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        title={`Adjust Stock - ${selectedStock?.product?.name}`}
        open={modalType === 'adjust'}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAdjustSubmit}>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between">
              <span>Current Stock:</span>
              <span className="font-bold">{selectedStock?.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-bold">{selectedStock?.availableQuantity}</span>
            </div>
          </div>

          <Form.Item
            label="Adjustment Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter adjustment quantity' }]}
            extra="Enter positive number to add stock, negative to reduce"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="e.g., 50 or -20"
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input placeholder="e.g., Stock count correction, Damaged items" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={adjustStock.isPending}>
                Adjust Stock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Stock Modal */}
      <Modal
        title={`Transfer Stock - ${selectedStock?.product?.name}`}
        open={modalType === 'transfer'}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleTransferSubmit}>
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="flex justify-between">
              <span>Available to Transfer:</span>
              <span className="font-bold">{selectedStock?.availableQuantity}</span>
            </div>
          </div>

          <Form.Item name="sourceWarehouseId" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="productId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Destination Warehouse"
            name="destinationWarehouseId"
            rules={[{ required: true, message: 'Please select destination warehouse' }]}
          >
            <Select placeholder="Select warehouse">
              {warehousesData?.data
                .filter((w) => w.id !== selectedStock?.warehouseId)
                .map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[
              { required: true, message: 'Please enter quantity' },
              {
                validator: (_, value) => {
                  if (value > (selectedStock?.availableQuantity || 0)) {
                    return Promise.reject('Quantity exceeds available stock');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1}
              max={selectedStock?.availableQuantity}
              style={{ width: '100%' }}
              placeholder="Quantity to transfer"
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input placeholder="e.g., Rebalancing stock, Fulfillment" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={transferStock.isPending}>
                Transfer Stock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
