import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Card,
  Tag,
  Switch,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdArrowBack, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import {
  useSupplier,
  useSupplierProducts,
  useAddSupplierProduct,
  useUpdateSupplierProduct,
  useRemoveSupplierProduct,
} from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';
import type { SupplierProduct, SupplierProductFormData } from '../services/supplier.service';

export default function SupplierProducts() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [form] = Form.useForm();

  const { data: supplier } = useSupplier(id || '');
  const { data: supplierProducts, isLoading } = useSupplierProducts(id || '');
  const { data: productsData } = useProducts({ limit: 1000 });
  const addProduct = useAddSupplierProduct();
  const updateProduct = useUpdateSupplierProduct();
  const removeProduct = useRemoveSupplierProduct();

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (product: SupplierProduct) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string, productName: string) => {
    Modal.confirm({
      title: 'Remove Product',
      content: `Are you sure you want to remove "${productName}" from this supplier?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: () => id && removeProduct.mutate({ supplierId: id, productId }),
    });
  };

  const handleSubmit = async (values: SupplierProductFormData) => {
    try {
      if (editingProduct && id) {
        await updateProduct.mutateAsync({
          supplierId: id,
          productId: editingProduct.productId,
          data: values,
        });
      } else if (id) {
        await addProduct.mutateAsync({ supplierId: id, data: values });
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const availableProducts = productsData?.data.filter(
    (p) => !supplierProducts?.some((sp) => sp.productId === p.id)
  );

  const columns: ColumnsType<SupplierProduct> = [
    {
      title: 'Product Name',
      key: 'product',
      render: (_, record) => record.product?.name || '-',
    },
    {
      title: 'SKU',
      key: 'sku',
      render: (_, record) => record.product?.sku || '-',
    },
    {
      title: 'Supplier SKU',
      dataIndex: 'supplierSku',
      key: 'supplierSku',
      render: (sku) => sku || '-',
    },
    {
      title: 'Cost Price',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (price) => (price ? `${price.toLocaleString()} XAF` : '-'),
    },
    {
      title: 'Lead Time',
      dataIndex: 'leadTimeDays',
      key: 'leadTimeDays',
      render: (days) => (days ? `${days} days` : '-'),
    },
    {
      title: 'Min Order Qty',
      dataIndex: 'minOrderQuantity',
      key: 'minOrderQuantity',
      render: (qty) => qty || '-',
    },
    {
      title: 'Preferred',
      key: 'isPreferred',
      render: (_, record) => (
        <Tag color={record.isPreferred ? 'green' : 'default'}>
          {record.isPreferred ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<MdEdit />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<MdDelete />}
            onClick={() => handleDelete(record.productId, record.product?.name || '')}
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button icon={<MdArrowBack />} onClick={() => navigate('/suppliers')} className="mb-4">
            Back to Suppliers
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{supplier?.name} - Products</h1>
              <p className="text-gray-600">Manage products linked to this supplier</p>
            </div>
            <Button type="primary" icon={<MdAdd />} onClick={handleAdd} size="large">
              Add Product
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={supplierProducts}
          rowKey="id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Supplier Product' : 'Add Product to Supplier'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingProduct && (
            <Form.Item
              label="Product"
              name="productId"
              rules={[{ required: true, message: 'Please select a product' }]}
            >
              <Select
                placeholder="Select product"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableProducts?.map((product) => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Supplier SKU" name="supplierSku">
            <Input placeholder="Supplier's product code" />
          </Form.Item>

          <Form.Item label="Cost Price" name="costPrice">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Cost price"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item label="Lead Time (Days)" name="leadTimeDays">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Delivery lead time" />
          </Form.Item>

          <Form.Item label="Minimum Order Quantity" name="minOrderQuantity">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Min order quantity" />
          </Form.Item>

          <Form.Item label="Preferred Supplier" name="isPreferred" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addProduct.isPending || updateProduct.isPending}
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
