import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Switch, Row, Col } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import { useWarehouse, useCreateWarehouse, useUpdateWarehouse } from '../hooks/useWarehouses';
import type { WarehouseFormData } from '../services/warehouse.service';

export default function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [form] = Form.useForm();
  const { data: warehouse } = useWarehouse(id || '');
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  useEffect(() => {
    if (warehouse) {
      form.setFieldsValue(warehouse);
    }
  }, [warehouse, form]);

  const handleSubmit = async (values: WarehouseFormData) => {
    try {
      if (isEditMode && id) {
        await updateWarehouse.mutateAsync({ id, data: values });
      } else {
        await createWarehouse.mutateAsync(values);
      }
      navigate('/warehouses');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button
            icon={<MdArrowBack />}
            onClick={() => navigate('/warehouses')}
            className="mb-4"
          >
            Back to Warehouses
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
          </h1>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, isDefault: false }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Warehouse Name"
                name="name"
                rules={[{ required: true, message: 'Please enter warehouse name' }]}
              >
                <Input placeholder="e.g., Main Warehouse Douala" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Warehouse Code"
                name="code"
                rules={[{ required: true, message: 'Please enter warehouse code' }]}
              >
                <Input placeholder="e.g., WH-DLA-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: 'Please enter country' }]}
              >
                <Input placeholder="e.g., Cameroon" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="e.g., Douala" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={3} placeholder="Full warehouse address" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="warehouse@example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="+237 XXX XXX XXX" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Set as Default Warehouse" name="isDefault" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createWarehouse.isPending || updateWarehouse.isPending}
            >
              {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
