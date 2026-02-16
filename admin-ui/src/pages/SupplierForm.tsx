import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, Switch, Row, Col, InputNumber } from 'antd';
import { MdArrowBack } from 'react-icons/md';
import { useSupplier, useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import type { SupplierFormData } from '../services/supplier.service';

export default function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [form] = Form.useForm();
  const { data: supplier } = useSupplier(id || '');
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  useEffect(() => {
    if (supplier) {
      form.setFieldsValue(supplier);
    }
  }, [supplier, form]);

  const handleSubmit = async (values: SupplierFormData) => {
    try {
      if (isEditMode && id) {
        await updateSupplier.mutateAsync({ id, data: values });
      } else {
        await createSupplier.mutateAsync(values);
      }
      navigate('/suppliers');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Button icon={<MdArrowBack />} onClick={() => navigate('/suppliers')} className="mb-4">
            Back to Suppliers
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
          </h1>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Supplier Name"
                name="name"
                rules={[{ required: true, message: 'Please enter supplier name' }]}
              >
                <Input placeholder="e.g., Acme Medical Supplies" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Supplier Code"
                name="code"
                rules={[{ required: true, message: 'Please enter supplier code' }]}
              >
                <Input placeholder="e.g., SUP-001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="supplier@example.com" />
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
              <Form.Item label="Contact Person" name="contactPerson">
                <Input placeholder="Primary contact name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Website" name="website">
                <Input placeholder="https://supplier-website.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={3} placeholder="Full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="City" name="city">
                <Input placeholder="e.g., Douala" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Country" name="country">
                <Input placeholder="e.g., Cameroon" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Payment Terms" name="paymentTerms">
                <Input placeholder="e.g., Net 30, Net 60" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Lead Time (Days)" name="leadTimeDays">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g., 14" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={4} placeholder="Additional notes about the supplier" />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createSupplier.isPending || updateSupplier.isPending}
            >
              {isEditMode ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
