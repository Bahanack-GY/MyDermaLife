import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Row,
    Col,
    Divider,
    Tabs,
    Upload,
    Image,
    Popconfirm,
    Empty,
} from 'antd';
import {
    SaveOutlined,
    ArrowLeftOutlined,
    DollarOutlined,
    TagsOutlined,
    FileTextOutlined,
    PictureOutlined,
    PlusOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useProduct, useCreateProduct, useUpdateProduct, useUploadProductImage, useDeleteProductImage } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { ProductFormData } from '../services/product.service';
import { API_CONFIG } from '../config/api.config';
import { showErrorToast } from '../utils/errorHandler';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

export default function ProductForm() {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { data: categoriesData } = useCategories();
    const { data: product } = useProduct(id || '');
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutate: uploadImage, isPending: isUploading } = useUploadProductImage();
    const { mutate: deleteImage } = useDeleteProductImage();

    const [activeTab, setActiveTab] = useState('1');
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | undefined>();
    const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);

    useEffect(() => {
        if (isEditMode && product && categoriesData) {
            // Get categoryId from either the field or the nested object
            const selectedCategoryId = product.categoryId || product.category?.id;

            let parentId: string | undefined;

            for (const parent of categoriesData) {
                if (parent.id === selectedCategoryId && !parent.parentCategoryId) {
                    // Selected category is a main category
                    parentId = parent.id;
                    break;
                } else if (parent.subcategories) {
                    const foundSub = parent.subcategories.find(sub => sub.id === selectedCategoryId);
                    if (foundSub) {
                        parentId = parent.id;
                        break;
                    }
                }
            }

            setSelectedMainCategoryId(parentId);

            const formValues = {
                // Core fields
                name: product.name,
                sku: product.sku,
                slug: product.slug,
                categoryId: selectedCategoryId, // Set from resolved categoryId

                // Descriptions
                shortDescription: product.shortDescription || '',
                longDescription: product.longDescription || '',

                // Pricing & Inventory
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                stockQuantity: product.stockQuantity,
                lowStockThreshold: product.lowStockThreshold,

                // Organization
                brandName: product.brandName || '',

                // Text fields
                usageInstructions: product.usageInstructions || '',
                warnings: product.warnings || '',

                // Arrays - ensure they're always arrays, never null/undefined
                skinTypes: product.skinTypes || [],
                conditionsTreated: product.conditionsTreated || [],
                benefits: product.benefits || [],
                tags: product.tags || [],
                ingredients: product.ingredients || [],

                // Booleans
                isActive: product.isActive,
                isFeatured: product.isFeatured,
                isNew: product.isNew,
                isBestSeller: product.isBestSeller,
                requiresPrescription: product.requiresPrescription,

                // SEO
                metaTitle: product.metaTitle || '',
                metaDescription: product.metaDescription || '',

                // Additional fields
                weightGrams: product.weightGrams,
                dimensions: product.dimensions,
            };

            // Set all form values at once
            form.setFieldsValue(formValues);
        }
    }, [isEditMode, product, categoriesData, form]);

    const onFinish = (values: any) => {
        // Transform values for backend - only set defaults for required fields
        const formData: ProductFormData = {
            ...values,
            // Only auto-generate slug if it's actually empty, not if it's defined
            slug: values.slug || values.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        };

        // Only set default SKU when creating, not updating
        if (!isEditMode) {
            formData.sku = values.sku || `SKU-${Date.now()}`;
        }

        if (isEditMode && id) {
            updateProduct(
                { id, data: formData, images: imagesToUpload.length > 0 ? imagesToUpload : undefined },
                {
                    onSuccess: () => {
                        navigate('/products');
                    },
                }
            );
        } else {
            createProduct(
                { data: formData, images: imagesToUpload.length > 0 ? imagesToUpload : undefined },
                {
                    onSuccess: () => {
                        navigate('/products');
                    },
                }
            );
        }
    };

    const parentCategories = categoriesData || [];

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <FileTextOutlined />
                    General Info
                </span>
            ),
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card bordered={false} className="shadow-sm rounded-xl">
                            <Form.Item
                                name="name"
                                label="Product Name"
                                rules={[{ required: true, message: 'Please enter product name' }]}
                            >
                                <Input size="large" placeholder="e.g. Vitamin C Serum" />
                            </Form.Item>

                            <Form.Item name="shortDescription" label="Short Description" help="Max 500 characters">
                                <TextArea rows={3} maxLength={500} showCount placeholder="Brief summary of the product" />
                            </Form.Item>

                            <Form.Item name="longDescription" label="Long Description">
                                <TextArea rows={6} placeholder="Detailed product description" />
                            </Form.Item>

                            {/* Main Category Selection */}
                            <Form.Item label="Main Category" required>
                                <Select
                                    size="large"
                                    placeholder="Select Main Category"
                                    value={selectedMainCategoryId}
                                    onChange={(value) => {
                                        setSelectedMainCategoryId(value);

                                        // Find the selected category
                                        const selectedCategory = parentCategories.find(p => p.id === value);

                                        // If category has no subcategories, set it as the categoryId directly
                                        if (selectedCategory && (!selectedCategory.subcategories || selectedCategory.subcategories.length === 0)) {
                                            form.setFieldValue('categoryId', value);
                                        } else {
                                            // Reset subcategory when main category changes
                                            form.setFieldValue('categoryId', undefined);
                                        }
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {parentCategories.map(parent => (
                                        <Option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Subcategory Selection */}
                            {(() => {
                                const selectedParent = parentCategories.find(parent => parent.id === selectedMainCategoryId);
                                const hasSubcategories = selectedParent?.subcategories && selectedParent.subcategories.length > 0;

                                // If main category has no subcategories, don't show this field
                                if (!hasSubcategories && selectedMainCategoryId) {
                                    return (
                                        <Form.Item name="categoryId" hidden>
                                            <Input />
                                        </Form.Item>
                                    );
                                }

                                return (
                                    <Form.Item
                                        name="categoryId"
                                        label="Subcategory"
                                        rules={[{ required: true, message: 'Please select a subcategory' }]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder={
                                                selectedMainCategoryId
                                                    ? "Select Subcategory"
                                                    : "Please select a main category first"
                                            }
                                            disabled={!selectedMainCategoryId}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {selectedMainCategoryId &&
                                                parentCategories
                                                    .find(parent => parent.id === selectedMainCategoryId)
                                                    ?.subcategories?.map(sub => (
                                                        <Option key={sub.id} value={sub.id}>
                                                            {sub.name}
                                                        </Option>
                                                    ))
                                            }
                                        </Select>
                                    </Form.Item>
                                );
                            })()}
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card bordered={false} className="shadow-sm rounded-xl">
                            <Title level={5}>Organization</Title>
                            <Form.Item name="brandName" label="Brand">
                                <Input placeholder="e.g. MyDermaLife" />
                            </Form.Item>

                            <Form.Item name="tags" label="Tags">
                                <Select mode="tags" placeholder="Enter tags" style={{ width: '100%' }} tokenSeparators={[',']}>
                                    {/* Options can be dynamically added by user typing */}
                                </Select>
                            </Form.Item>

                            <Divider />

                            <Title level={5}>Status</Title>
                            <Form.Item name="isActive" valuePropName="checked">
                                <Switch checkedChildren="Active" unCheckedChildren="Draft" />
                            </Form.Item>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div className="flex items-center">
                                    <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                                        <Switch size="small" />
                                    </Form.Item>
                                    <Text className="ml-2">Featured Product</Text>
                                </div>
                                <div className="h-2" />
                                <div className="flex items-center">
                                    <Form.Item name="isNew" valuePropName="checked" noStyle>
                                        <Switch size="small" />
                                    </Form.Item>
                                    <Text className="ml-2">New Arrival</Text>
                                </div>
                                <div className="h-2" />
                                <div className="flex items-center">
                                    <Form.Item name="isBestSeller" valuePropName="checked" noStyle>
                                        <Switch size="small" />
                                    </Form.Item>
                                    <Text className="ml-2">Best Seller</Text>
                                </div>
                                <div className="h-2" />
                                <div className="flex items-center">
                                    <Form.Item name="requiresPrescription" valuePropName="checked" noStyle>
                                        <Switch size="small" />
                                    </Form.Item>
                                    <Text className="ml-2">Requires Prescription</Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: (
                <span>
                    <DollarOutlined />
                    Pricing & Inventory
                </span>
            ),
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <Card title="Pricing" bordered={false} className="shadow-sm rounded-xl h-full">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price"
                                        label="Price (XAF)"
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                                            min={0}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="compareAtPrice"
                                        label="Compare at Price"
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                                            min={0}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name="costPrice"
                                label="Cost Price (Internal)"
                                help="Customers won't see this"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                                    min={0}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Inventory" bordered={false} className="shadow-sm rounded-xl h-full">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="sku" label="SKU (Stock Keeping Unit)">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="barcode" label="Barcode (ISBN, UPC, etc.)">
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="stockQuantity" label="Quantity" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="lowStockThreshold" label="Low Stock Threshold">
                                        <InputNumber style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '3',
            label: (
                <span>
                    <TagsOutlined />
                    Attributes
                </span>
            ),
            children: (
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <Form.Item name="skinTypes" label="Skin Types">
                        <Select mode="multiple" placeholder="Select skin types">
                            <Option value="oily">Oily</Option>
                            <Option value="dry">Dry</Option>
                            <Option value="combination">Combination</Option>
                            <Option value="sensitive">Sensitive</Option>
                            <Option value="normal">Normal</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="conditionsTreated" label="Conditions Treated">
                        <Select mode="tags" placeholder="e.g. acne, aging, hyperpigmentation" tokenSeparators={[',']} />
                    </Form.Item>

                    <Form.Item name="benefits" label="Benefits">
                        <Select mode="tags" placeholder="e.g. Hydrates skin, Reduces wrinkles" tokenSeparators={[',']} />
                    </Form.Item>

                    <Form.Item name="ingredients" label="Key Ingredients">
                        <Select mode="tags" placeholder="e.g. Aloe Vera, Glycérine, Vitamin C" tokenSeparators={[',']} />
                    </Form.Item>

                    <Form.Item name="usageInstructions" label="Usage Instructions">
                        <TextArea rows={4} placeholder="Appliquer matin et soir sur peau humide..." />
                    </Form.Item>

                    <Form.Item name="warnings" label="Warnings / Precautions">
                        <TextArea rows={3} placeholder="For external use only. Avoid contact with eyes." />
                    </Form.Item>
                </Card>
            )
        },
        {
            key: '4',
            label: (
                <span>
                    <PictureOutlined />
                    {' '}Images
                </span>
            ),
            children: (
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <div className="space-y-6">
                            {/* Existing images */}
                            {product?.images && product.images.length > 0 && (
                                <div>
                                    <Text strong className="block mb-3">Current Images</Text>
                                    <div className="flex flex-wrap gap-4">
                                        {product.images
                                            .sort((a, b) => a.sortOrder - b.sortOrder)
                                            .map((img, idx) => (
                                                <div
                                                    key={img.id}
                                                    className="relative group"
                                                    style={{
                                                        width: 140,
                                                        border: img.isPrimary ? '2px solid #9B563A' : '1px solid #f0f0f0',
                                                        borderRadius: 12,
                                                        overflow: 'hidden',
                                                        background: '#fafafa',
                                                    }}
                                                >
                                                    {img.imageUrl ? (
                                                        <Image
                                                            src={`${API_CONFIG.BASE_URL}${img.imageUrl}`}
                                                            alt={img.altText || 'Product image'}
                                                            width={140}
                                                            height={140}
                                                            style={{ objectFit: 'cover', display: 'block' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: 140,
                                                                height: 140,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                background: '#fafafa',
                                                                color: '#999',
                                                            }}
                                                        >
                                                            <Text type="secondary">No URL</Text>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between px-2 py-1">
                                                        {img.isPrimary && (
                                                            <Text style={{ fontSize: 11, color: '#9B563A' }} strong>Primary</Text>
                                                        )}
                                                        <Popconfirm
                                                            title="Delete this image?"
                                                            onConfirm={() => deleteImage({ productId: id!, imageId: img.id })}
                                                            okText="Delete"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                className="ml-auto"
                                                            />
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Upload new images */}
                        <div>
                            <Text strong className="block mb-3">
                                {isEditMode ? 'Upload Additional Images' : 'Upload Product Images'}
                            </Text>

                            {/* Preview of images to upload (create mode) */}
                            {!isEditMode && imagesToUpload.length > 0 && (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {imagesToUpload.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                border: '1px solid #f0f0f0',
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                background: '#fafafa',
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                onClick={() => {
                                                    setImagesToUpload(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    background: 'rgba(255,255,255,0.9)',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Upload
                                accept="image/jpeg,image/png,image/webp"
                                multiple={!isEditMode}
                                maxCount={isEditMode ? 1 : 10}
                                showUploadList={false}
                                beforeUpload={(file, fileList) => {
                                    // Validate file size
                                    if (file.size > 5 * 1024 * 1024) {
                                        showErrorToast('File size must be less than 5MB');
                                        return Upload.LIST_IGNORE;
                                    }

                                    if (isEditMode) {
                                        // In edit mode, upload immediately
                                        uploadImage({
                                            productId: id!,
                                            file: file as File,
                                            options: {
                                                isPrimary: !product?.images || product.images.length === 0,
                                            },
                                        });
                                    } else {
                                        // In create mode, add to state
                                        setImagesToUpload(prev => {
                                            const newImages = [...prev, file];
                                            return newImages.slice(0, 10); // Max 10 images
                                        });
                                    }

                                    return false; // Prevent auto upload
                                }}
                                disabled={isEditMode && isUploading}
                            >
                                <Button
                                    icon={<PlusOutlined />}
                                    loading={isEditMode && isUploading}
                                    size="large"
                                    disabled={!isEditMode && imagesToUpload.length >= 10}
                                >
                                    {isEditMode
                                        ? (isUploading ? 'Uploading...' : 'Add Image')
                                        : `Select Images (${imagesToUpload.length}/10)`
                                    }
                                </Button>
                            </Upload>
                            <Text type="secondary" className="block mt-2" style={{ fontSize: 12 }}>
                                {isEditMode
                                    ? 'Upload one image at a time. Images will be added immediately.'
                                    : 'Select up to 10 images. They will be uploaded when you save the product. First image will be set as primary.'}
                                <br />
                                Accepts JPEG, PNG, WebP. Max 5MB per image.
                            </Text>
                        </div>
                    </div>
                </Card>
            ),
        },
        {
            key: '5',
            label: 'SEO',
            children: (
                <Card bordered={false} className="shadow-sm rounded-xl">
                    <Form.Item name="slug" label="Page Title (Slug)" help="Leave blank to auto-generate from name">
                        <Input addonBefore=".../products/" />
                    </Form.Item>
                    <Form.Item name="metaTitle" label="Meta Title">
                        <Input showCount maxLength={70} />
                    </Form.Item>
                    <Form.Item name="metaDescription" label="Meta Description">
                        <TextArea rows={2} showCount maxLength={160} />
                    </Form.Item>
                </Card>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Space align="center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={() => navigate('/products')}
                    />
                    <div>
                        <Title level={2} className="font-serif !mb-0">
                            {isEditMode ? 'Edit Product' : 'Add Product'}
                        </Title>
                        <Text type="secondary">
                            {isEditMode ? `Editing product ID: ${id}` : 'Create a new product in your catalog'}
                        </Text>
                    </div>
                </Space>

                <Space>
                    <Button onClick={() => navigate('/products')}>Cancel</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={isCreating || isUpdating}
                        style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}
                    >
                        Save Product
                    </Button>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={!isEditMode ? {
                    isActive: true,
                    isFeatured: false,
                    isNew: true,
                    stockQuantity: 0,
                    lowStockThreshold: 5,
                    price: 0
                } : undefined}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    type="card"
                    className="custom-tabs"
                />
            </Form>
        </div>
    );
}
