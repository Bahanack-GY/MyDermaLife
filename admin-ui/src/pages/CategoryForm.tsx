import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Space,
  Switch,
  Typography,
  Upload,
  Image,
  Popconfirm,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useCategory,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useUploadCategoryImage,
  useDeleteCategoryImage,
} from '../hooks/useCategories';
import type { CategoryFormData } from '../services/category.service';
import { API_CONFIG } from '../config/api.config';
import { showErrorToast } from '../utils/errorHandler';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parent');
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: categoriesData } = useCategories();
  const { data: category } = useCategory(id || '');
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: uploadImage, isPending: isUploading } = useUploadCategoryImage();
  const { mutate: deleteImage } = useDeleteCategoryImage();

  useEffect(() => {
    if (isEditMode && category) {
      console.log('[CategoryForm] Loading category for edit:', category);
      console.log('[CategoryForm] Category fields:', {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentCategoryId: category.parentCategoryId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        imageUrl: category.imageUrl,
      });

      const formValues = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentCategoryId: category.parentCategoryId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      };

      console.log('[CategoryForm] Setting form values:', formValues);
      form.setFieldsValue(formValues);

      console.log('[CategoryForm] Form values after setting:', form.getFieldsValue());
    } else if (!isEditMode && parentId) {
      // Pre-fill parent category when adding subcategory
      console.log('[CategoryForm] Pre-filling parent category:', parentId);
      form.setFieldValue('parentCategoryId', parentId);
    }
  }, [isEditMode, category, parentId, form]);

  const onFinish = (values: any) => {
    const formData: CategoryFormData = {
      ...values,
      // Auto-generate slug if empty
      slug: values.slug || values.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      // Set parentCategoryId to null if empty string
      parentCategoryId: values.parentCategoryId || null,
    };

    console.log('[CategoryForm] Form values:', values);
    console.log('[CategoryForm] Processed formData:', formData);
    console.log('[CategoryForm] Selected image:', selectedImage);

    if (isEditMode && id) {
      updateCategory(
        { id, data: formData, image: selectedImage || undefined },
        {
          onSuccess: () => {
            console.log('[CategoryForm] Update successful');
            navigate('/categories');
          },
          onError: (error: any) => {
            console.error('[CategoryForm] Update failed:', error);
            console.error('[CategoryForm] Error response:', error.response?.data);
          },
        }
      );
    } else {
      createCategory(
        { data: formData, image: selectedImage || undefined },
        {
          onSuccess: () => {
            console.log('[CategoryForm] Create successful');
            navigate('/categories');
          },
          onError: (error: any) => {
            console.error('[CategoryForm] Create failed:', error);
            console.error('[CategoryForm] Error response:', error.response?.data);
          },
        }
      );
    }
  };

  // Get only main categories for parent selection
  const mainCategories = categoriesData?.filter(cat => !cat.parentCategoryId) || [];

  // Find parent name if adding subcategory
  const parentCategory = parentId ? mainCategories.find(cat => cat.id === parentId) : null;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => navigate('/categories')}
          />
          <div>
            <Title level={2} className="font-serif !mb-0">
              {isEditMode ? 'Edit Category' : parentCategory ? `Add Subcategory to "${parentCategory.name}"` : 'Add Category'}
            </Title>
            <Text type="secondary">
              {isEditMode
                ? `Editing category ID: ${id}`
                : parentCategory
                  ? `Create a new subcategory under ${parentCategory.name}`
                  : 'Create a new category'}
            </Text>
          </div>
        </Space>

        <Space>
          <Button onClick={() => navigate('/categories')}>Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={isCreating || isUpdating}
            style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}
          >
            Save Category
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          isActive: true,
          sortOrder: 0,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card bordered={false} className="shadow-sm rounded-xl">
              <Form.Item
                name="name"
                label="Category Name"
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
                <Input size="large" placeholder="e.g. Moisturizers" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug"
                help="Leave blank to auto-generate from name"
              >
                <Input placeholder="e.g. moisturizers" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea rows={4} placeholder="Brief description of this category" />
              </Form.Item>

              <Form.Item
                name="parentCategoryId"
                label="Parent Category"
                help="Leave empty for main category, or select a parent to create a subcategory"
              >
                <Select
                  size="large"
                  placeholder="Select parent category (optional)"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {mainCategories.map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="sortOrder" label="Sort Order">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card bordered={false} className="shadow-sm rounded-xl mb-6">
              <Title level={5}>Status</Title>
              <Form.Item name="isActive" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Card>

            {/* Image Upload */}
            <Card bordered={false} className="shadow-sm rounded-xl">
              <Title level={5}>Category Image</Title>

              {/* Show existing image in edit mode */}
              {isEditMode && category?.imageUrl && !imagePreview && (
                <div className="mb-4">
                  <Image
                    src={`${API_CONFIG.BASE_URL}${category.imageUrl}`}
                    alt={category.name}
                    width="100%"
                    style={{ borderRadius: 8 }}
                  />
                  <Popconfirm
                    title="Delete this image?"
                    onConfirm={() => deleteImage(id!)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      block
                      className="mt-2"
                    >
                      Remove Image
                    </Button>
                  </Popconfirm>
                </div>
              )}

              {/* Show preview of selected image */}
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    block
                    className="mt-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              )}

              <Upload
                accept="image/jpeg,image/png,image/webp"
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => {
                  if (file.size > 5 * 1024 * 1024) {
                    showErrorToast('File size must be less than 5MB');
                    return Upload.LIST_IGNORE;
                  }

                  // Set selected image and preview
                  setSelectedImage(file);
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);

                  return false;
                }}
              >
                <Button
                  icon={<PlusOutlined />}
                  block
                >
                  {imagePreview || category?.imageUrl ? 'Replace Image' : 'Upload Image'}
                </Button>
              </Upload>
              <Text type="secondary" className="block mt-2" style={{ fontSize: 12 }}>
                Accepts JPEG, PNG, WebP. Max 5MB.
                {!isEditMode && <><br />Image will be uploaded when you save the category.</>}
              </Text>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}
