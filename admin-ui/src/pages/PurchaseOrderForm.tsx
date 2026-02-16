import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdArrowBack, MdAdd, MdDelete } from 'react-icons/md';
import { useCreatePurchaseOrder } from '../hooks/usePurchaseOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import { useWarehouses } from '../hooks/useWarehouses';
import { useProducts } from '../hooks/useProducts';
import type { PurchaseOrderItemInput } from '../services/purchaseOrder.service';

interface OrderItem extends PurchaseOrderItemInput {
  key: string;
  productName?: string;
}

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>();
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);

  const { data: suppliersData } = useSuppliers({ limit: 1000, isActive: true });
  const { data: warehousesData } = useWarehouses({ limit: 1000, isActive: true });
  const { data: productsData } = useProducts({ limit: 1000 });
  const createPO = useCreatePurchaseOrder();

  const addItem = () => {
    if (!selectedProduct || !quantity || !unitCost) return;

    const product = productsData?.data.find((p) => p.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      key: Date.now().toString(),
      productId: selectedProduct,
      productName: product.name,
      quantityOrdered: quantity,
      unitCost,
    };

    setItems([...items, newItem]);
    setSelectedProduct(undefined);
    setQuantity(1);
    setUnitCost(0);
  };

  const removeItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantityOrdered * item.unitCost, 0);
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      return;
    }

    try {
      const formData = {
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        expectedDeliveryDate: values.expectedDeliveryDate?.toISOString(),
        taxAmount: values.taxAmount || 0,
        shippingCost: values.shippingCost || 0,
        currency: values.currency || 'XAF',
        notes: values.notes,
        items: items.map(({ key, productName, ...item }) => item),
      };

      await createPO.mutateAsync(formData);
      navigate('/purchase-orders');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<OrderItem> = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantityOrdered',
      key: 'quantityOrdered',
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost) => `${cost.toLocaleString()} XAF`,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `${(record.quantityOrdered * record.unitCost).toLocaleString()} XAF`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<MdDelete />}
          onClick={() => removeItem(record.key)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const subtotal = calculateSubtotal();
  const taxAmount = form.getFieldValue('taxAmount') || 0;
  const shippingCost = form.getFieldValue('shippingCost') || 0;
  const total = subtotal + taxAmount + shippingCost;

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
          <h1 className="text-2xl font-bold text-gray-800">Create Purchase Order</h1>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Supplier"
                name="supplierId"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier" showSearch optionFilterProp="children">
                  {suppliersData?.data.map((supplier) => (
                    <Select.Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Warehouse"
                name="warehouseId"
                rules={[{ required: true, message: 'Please select warehouse' }]}
              >
                <Select placeholder="Select warehouse" showSearch optionFilterProp="children">
                  {warehousesData?.data.map((warehouse) => (
                    <Select.Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Expected Delivery Date" name="expectedDeliveryDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Currency" name="currency" initialValue="XAF">
                <Select>
                  <Select.Option value="XAF">XAF</Select.Option>
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="EUR">EUR</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <Row gutter={16}>
              <Col xs={24} md={10}>
                <Select
                  placeholder="Select product"
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {productsData?.data.map((product) => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} md={5}>
                <InputNumber
                  min={1}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  placeholder="Quantity"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={12} md={5}>
                <InputNumber
                  min={0}
                  value={unitCost}
                  onChange={(val) => setUnitCost(val || 0)}
                  placeholder="Unit Cost"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} md={4}>
                <Button type="dashed" icon={<MdAdd />} onClick={addItem} block>
                  Add
                </Button>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            className="mb-6"
          />

          <Card className="mb-6 bg-gray-50">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Tax Amount" name="taxAmount">
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="0"
                    onChange={() => form.validateFields()}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Shipping Cost" name="shippingCost">
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="0"
                    onChange={() => form.validateFields()}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Subtotal: {subtotal.toLocaleString()} XAF</div>
                  <div className="text-sm text-gray-600">Tax: {taxAmount.toLocaleString()} XAF</div>
                  <div className="text-sm text-gray-600">
                    Shipping: {shippingCost.toLocaleString()} XAF
                  </div>
                  <div className="text-xl font-bold mt-2">Total: {total.toLocaleString()} XAF</div>
                </div>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space>
              <Button onClick={() => navigate('/purchase-orders')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={createPO.isPending}
                disabled={items.length === 0}
              >
                Create Purchase Order
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
