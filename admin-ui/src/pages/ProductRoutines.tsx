import { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Upload,
  Image,
  Popconfirm,
  Tag,
  Drawer,
  InputNumber,
  Empty,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  useRoutines,
  useRoutine,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useReplaceProducts,
  useUploadRoutineImage,
  useDeleteRoutineImage,
} from '../hooks/useRoutines';
import { useProducts } from '../hooks/useProducts';
import type { Routine, RoutineProductItem } from '../services/routine.service';
import { API_CONFIG } from '../config/api.config';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProductFormItem extends RoutineProductItem {
  key: string;
  productName?: string;
  productPrice?: number;
  productImage?: string | null;
}

export default function ProductRoutines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [productItems, setProductItems] = useState<ProductFormItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Queries
  const { data: routinesData, isLoading: routinesLoading } = useRoutines({
    search: searchTerm || undefined,
    limit: 100,
  });
  const { data: selectedRoutine } = useRoutine(selectedRoutineId);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 100,
    search: productSearch || undefined,
  });

  // Mutations
  const { mutate: createRoutine, isPending: isCreating } = useCreateRoutine();
  const { mutate: updateRoutine, isPending: isUpdating } = useUpdateRoutine();
  const { mutate: deleteRoutine } = useDeleteRoutine();
  const { mutate: replaceProducts, isPending: isSavingProducts } = useReplaceProducts();
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadRoutineImage();
  const { mutate: deleteImage } = useDeleteRoutineImage();

  // Handle create routine
  const handleCreate = (values: any) => {
    const data = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      isActive: values.isActive ?? true,
    };

    createRoutine(
      { data, image: imageFile },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          setImageFile(undefined);
          setImagePreview(undefined);
        },
      }
    );
  };

  // Handle edit routine
  const handleEdit = (values: any) => {
    if (!selectedRoutineId) return;

    const data = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      isActive: values.isActive,
    };

    updateRoutine(
      { id: selectedRoutineId, data, image: imageFile },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setImageFile(undefined);
          setImagePreview(undefined);
          setSelectedRoutineId(undefined);
        },
      }
    );
  };

  // Open edit modal
  const openEditModal = (routine: Routine) => {
    setSelectedRoutineId(routine.id);
    editForm.setFieldsValue({
      name: routine.name,
      slug: routine.slug,
      description: routine.description,
      isActive: routine.isActive,
    });
    setImagePreview(undefined);
    setImageFile(undefined);
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteRoutine(id);
  };

  // Open product drawer
  const openProductDrawer = (routine: Routine) => {
    setSelectedRoutineId(routine.id);

    // Load existing products
    if (routine.products && routine.products.length > 0) {
      const items: ProductFormItem[] = routine.products.map((rp, index) => ({
        key: `product-${index}`,
        productId: rp.product.id,
        stepOrder: rp.stepOrder,
        stepLabel: rp.stepLabel,
        productName: rp.product.name,
        productPrice: rp.product.price,
        productImage: rp.product.primaryImage,
      }));
      setProductItems(items);
    } else {
      setProductItems([]);
    }

    setIsProductDrawerOpen(true);
  };

  // Add product item
  const handleAddProductItem = () => {
    const newItem: ProductFormItem = {
      key: `new-${Date.now()}`,
      productId: '',
      stepOrder: productItems.length + 1,
      stepLabel: '',
    };
    setProductItems([...productItems, newItem]);
  };

  // Remove product item
  const handleRemoveProductItem = (key: string) => {
    const newItems = productItems.filter((item) => item.key !== key);
    // Reorder
    const reordered = newItems.map((item, index) => ({
      ...item,
      stepOrder: index + 1,
    }));
    setProductItems(reordered);
  };

  // Update product item field
  const handleProductItemChange = (key: string, field: keyof ProductFormItem, value: any) => {
    const newItems = productItems.map((item) => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };

        // If changing product, update related fields
        if (field === 'productId') {
          const product = productsData?.data.find((p) => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.productPrice = product.price;
            updated.productImage =
              product.images?.find((img) => img.isPrimary)?.imageUrl ||
              product.images?.[0]?.imageUrl ||
              null;
          }
        }

        return updated;
      }
      return item;
    });
    setProductItems(newItems);
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...productItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    // Reorder
    const reordered = newItems.map((item, idx) => ({ ...item, stepOrder: idx + 1 }));
    setProductItems(reordered);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === productItems.length - 1) return;
    const newItems = [...productItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    // Reorder
    const reordered = newItems.map((item, idx) => ({ ...item, stepOrder: idx + 1 }));
    setProductItems(reordered);
  };

  // Save products
  const handleSaveProducts = () => {
    if (!selectedRoutineId) return;

    // Validate
    for (const item of productItems) {
      if (!item.productId) {
        Modal.error({ title: 'Error', content: 'All products must be selected' });
        return;
      }
      if (!item.stepLabel || item.stepLabel.trim() === '') {
        Modal.error({ title: 'Error', content: 'All step labels are required' });
        return;
      }
    }

    const data = {
      items: productItems.map((item) => ({
        productId: item.productId,
        stepOrder: item.stepOrder,
        stepLabel: item.stepLabel,
      })),
    };

    replaceProducts(
      { routineId: selectedRoutineId, data },
      {
        onSuccess: () => {
          setIsProductDrawerOpen(false);
          setProductItems([]);
          setSelectedRoutineId(undefined);
        },
      }
    );
  };

  // Handle image upload
  const handleImageChange = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for existing routine
  const handleUploadImage = (routineId: string, file: File) => {
    uploadImage({ routineId, image: file });
  };

  // Handle delete image
  const handleDeleteImage = (routineId: string) => {
    deleteImage(routineId);
  };

  // Table columns
  const columns: ColumnsType<Routine> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (imageUrl: string | null) =>
        imageUrl ? (
          <Image
            src={`${API_CONFIG.BASE_URL}${imageUrl}`}
            alt="Routine"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
          </div>
        ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Routine) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
          {desc || '-'}
        </Text>
      ),
    },
    {
      title: 'Products',
      key: 'productsCount',
      width: 100,
      render: (_, record: Routine) => (
        <Text>{record.products?.length || 0} products</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record: Routine) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => openProductDrawer(record)}
            size="small"
          >
            Products
          </Button>
          <Popconfirm
            title="Delete this routine?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Product drawer columns
  const productColumns: ColumnsType<ProductFormItem> = [
    {
      title: 'Order',
      dataIndex: 'stepOrder',
      width: 100,
      render: (_, record, index) => (
        <Space>
          <Text strong>{record.stepOrder}</Text>
          <Space.Compact direction="vertical">
            <Button
              type="text"
              size="small"
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
            >
              ▲
            </Button>
            <Button
              type="text"
              size="small"
              onClick={() => handleMoveDown(index)}
              disabled={index === productItems.length - 1}
            >
              ▼
            </Button>
          </Space.Compact>
        </Space>
      ),
    },
    {
      title: 'Step Label',
      dataIndex: 'stepLabel',
      width: 200,
      render: (_, record) => (
        <Input
          placeholder="e.g., Nettoyant, Sérum"
          value={record.stepLabel}
          onChange={(e) => handleProductItemChange(record.key, 'stepLabel', e.target.value)}
          maxLength={100}
        />
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productId',
      render: (_, record) => (
        <Select
          showSearch
          placeholder="Select product"
          value={record.productId || undefined}
          onChange={(value) => handleProductItemChange(record.key, 'productId', value)}
          onSearch={(value) => setProductSearch(value)}
          style={{ width: '100%' }}
          filterOption={false}
          options={productsData?.data.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
        />
      ),
    },
    {
      title: 'Preview',
      key: 'preview',
      width: 200,
      render: (_, record) => {
        if (!record.productName) return <Text type="secondary">-</Text>;
        return (
          <Space>
            {record.productImage ? (
              <Image
                src={`${API_CONFIG.BASE_URL}${record.productImage}`}
                alt={record.productName}
                width={40}
                height={40}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                preview={false}
              />
            ) : (
              <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: 4 }} />
            )}
            <div>
              <Text strong style={{ fontSize: 12 }}>
                {record.productName}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.productPrice} XAF
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Remove this product?"
          onConfirm={() => handleRemoveProductItem(record.key)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>Skincare Routines</Title>
              <Text type="secondary">
                Manage standalone routines with curated product sequences
              </Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
                size="large"
              >
                Create Routine
              </Button>
            </Col>
          </Row>

          <Divider />

          <Input.Search
            placeholder="Search routines by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />

          <Table
            columns={columns}
            dataSource={routinesData?.data || []}
            loading={routinesLoading}
            rowKey="id"
            pagination={{
              total: routinesData?.total,
              pageSize: routinesData?.limit || 10,
              current: routinesData?.page || 1,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} routines`,
            }}
          />
        </Space>
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create New Routine"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          setImageFile(undefined);
          setImagePreview(undefined);
        }}
        onOk={() => createForm.submit()}
        confirmLoading={isCreating}
        width={600}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Routine Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input placeholder="e.g., Routine Anti-Acné" />
          </Form.Item>

          <Form.Item name="slug" label="Slug" help="Leave blank to auto-generate">
            <Input placeholder="e.g., routine-anti-acne" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe this routine" />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item label="Image">
            {imagePreview && (
              <div style={{ marginBottom: 12 }}>
                <Image src={imagePreview} alt="Preview" width={200} />
              </div>
            )}
            <Upload
              accept="image/jpeg,image/png,image/webp"
              showUploadList={false}
              beforeUpload={(file) => {
                if (file.size > 5 * 1024 * 1024) {
                  Modal.error({ title: 'Error', content: 'File size must be less than 5MB' });
                  return Upload.LIST_IGNORE;
                }
                handleImageChange(file);
                return false;
              }}
            >
              <Button icon={<PictureOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Routine"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          editForm.resetFields();
          setImageFile(undefined);
          setImagePreview(undefined);
          setSelectedRoutineId(undefined);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={isUpdating}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Routine Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item label="Image">
            {selectedRoutine?.imageUrl && !imagePreview && (
              <div style={{ marginBottom: 12 }}>
                <Image
                  src={`${API_CONFIG.BASE_URL}${selectedRoutine.imageUrl}`}
                  alt="Current"
                  width={200}
                />
              </div>
            )}
            {imagePreview && (
              <div style={{ marginBottom: 12 }}>
                <Image src={imagePreview} alt="Preview" width={200} />
              </div>
            )}
            <Space>
              <Upload
                accept="image/jpeg,image/png,image/webp"
                showUploadList={false}
                beforeUpload={(file) => {
                  if (file.size > 5 * 1024 * 1024) {
                    Modal.error({ title: 'Error', content: 'File size must be less than 5MB' });
                    return Upload.LIST_IGNORE;
                  }
                  handleImageChange(file);
                  return false;
                }}
              >
                <Button icon={<PictureOutlined />}>Change Image</Button>
              </Upload>
              {selectedRoutine?.imageUrl && (
                <Popconfirm
                  title="Delete current image?"
                  onConfirm={() => handleDeleteImage(selectedRoutine.id)}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Current
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Products Drawer */}
      <Drawer
        title={`Manage Products - ${selectedRoutine?.name || ''}`}
        placement="right"
        width={900}
        open={isProductDrawerOpen}
        onClose={() => {
          setIsProductDrawerOpen(false);
          setProductItems([]);
          setSelectedRoutineId(undefined);
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setIsProductDrawerOpen(false);
                setProductItems([]);
                setSelectedRoutineId(undefined);
              }}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSaveProducts}
              loading={isSavingProducts}
              icon={<SaveOutlined />}
            >
              Save Products
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddProductItem}
            block
            size="large"
          >
            Add Product Step
          </Button>

          {productItems.length === 0 ? (
            <Empty description="No products added yet. Click above to add the first step." />
          ) : (
            <Table
              columns={productColumns}
              dataSource={productItems}
              pagination={false}
              rowKey="key"
              bordered
            />
          )}
        </Space>
      </Drawer>
    </div>
  );
}
