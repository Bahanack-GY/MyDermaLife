import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Card,
  Image,
  Popconfirm,
  Typography,
  Row,
  Col,
  InputNumber,
  Flex,
  theme,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../services/product.service';
import { API_CONFIG } from '../config/api.config';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Products() {
  const { token } = theme.useToken();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // Check for category filter in URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setCategoryId(categoryFromUrl);
    }
  }, [searchParams]);
  const [skinType, setSkinType] = useState<string | undefined>(undefined);
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
  const [isNew, setIsNew] = useState<boolean | undefined>(undefined);
  const [isBestSeller, setIsBestSeller] = useState<boolean | undefined>(undefined);
  const [requiresPrescription, setRequiresPrescription] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categoriesData } = useCategories();
  const { data, isLoading, refetch } = useProducts({
    search: search || undefined,
    categoryId,
    skinType,
    isFeatured,
    isNew,
    isBestSeller,
    requiresPrescription,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setSkinType(undefined);
    setIsFeatured(undefined);
    setIsNew(undefined);
    setIsBestSeller(undefined);
    setRequiresPrescription(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('createdAt');
    setSortOrder('DESC');
    setPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const parentCategories = categoriesData || [];

  const columns: ColumnsType<Product> = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, record: Product) => {
        // Debug logging for images
        if (record.images && record.images.length > 0) {
          console.log('[Products] Product:', record.name);
          console.log('[Products] Images array:', record.images);
          console.log('[Products] First image:', record.images[0]);
          console.log('[Products] Image URL:', record.images[0]?.imageUrl);
          console.log('[Products] Full URL:', `${API_CONFIG.BASE_URL}${record.images[0]?.imageUrl || ''}`);
        }

        return (
          <Space size="middle">
            {record.images && record.images.length > 0 && record.images[0]?.imageUrl ? (
              <Image
                src={`${API_CONFIG.BASE_URL}${record.images[0].imageUrl}`}
                alt={name}
                width={56}
                height={56}
                style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #f0f0f0' }}
                preview={{ maskClassName: 'rounded-lg' }}
                onError={(e) => {
                  console.error('[Products] Image failed to load:', {
                    src: e.currentTarget.src,
                    product: record.name,
                    imageData: record.images[0]
                  });
                }}
              />
            ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PictureOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
            </div>
          )}
          <div className="flex flex-col">
            <Text strong className="text-base">{name}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>SKU: {record.sku}</Text>
          </div>
        </Space>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (category: any) => (
        <div className="flex flex-col gap-0.5">
          {category?.parentCategory && (
            <Text type="secondary" style={{ fontSize: 11 }}>{category.parentCategory.name}</Text>
          )}
          <Tag bordered={false} style={{ fontSize: 13 }}>
            {category?.name || 'Uncategorized'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number, record: Product) => (
        <div className="flex flex-col">
          <Text strong style={{ color: token.colorPrimary }}>{formatPrice(price)}</Text>
          {record.compareAtPrice && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              {formatPrice(record.compareAtPrice)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stockQuantity',
      key: 'stock',
      width: 120,
      render: (stock: number, record: Product) => {
        let color = 'success';
        if (stock === 0) color = 'error';
        else if (stock <= record.lowStockThreshold) color = 'warning';

        return (
          <Tag color={color} bordered={false}>
            {stock} in stock
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 250,
      render: (_: any, record: Product) => (
        <Space size={4} wrap>
          {!record.isActive && <Tag>Inactive</Tag>}
          {record.isFeatured && <Tag color="purple" bordered={false}>Featured</Tag>}
          {record.isNew && <Tag color="cyan" bordered={false}>New</Tag>}
          {record.isBestSeller && <Tag color="gold" bordered={false}>Best Seller</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Edit Product">
            <Link to={`/products/edit/${record.id}`}>
              <Button
                type="text"
                shape="circle"
                icon={<EditOutlined />}
                style={{ color: token.colorPrimary }}
              />
            </Link>
          </Tooltip>

          <Tooltip title="Delete Product">
            <Popconfirm
              title="Delete Product"
              description={`Are you sure you want to delete "${record.name}"?`}
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                loading={isDeleting}
              />
            </Popconfirm>
          </Tooltip>
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
            Products
          </Title>
          <Text type="secondary">
            Manage your product catalog, prices, and inventory
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Refresh
          </Button>
          <Link to="/products/add">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }} // Keep brand color for primary action
            >
              Add Product
            </Button>
          </Link>
        </Space>
      </div>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Space direction="vertical" size="large" className="w-full">
          {/* Row 1: Search & Main Filters */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by name or SKU..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Category"
                value={categoryId}
                onChange={setCategoryId}
                size="large"
                className="w-full"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {parentCategories.map((parent) => (
                  parent.subcategories && parent.subcategories.length > 0 ? (
                    <Select.OptGroup key={parent.id} label={parent.name}>
                      {parent.subcategories.map((sub: any) => (
                        <Option key={sub.id} value={sub.id}>{sub.name}</Option>
                      ))}
                    </Select.OptGroup>
                  ) : (
                    <Option key={parent.id} value={parent.id}>{parent.name}</Option>
                  )
                ))}
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Skin Type"
                value={skinType}
                onChange={setSkinType}
                size="large"
                className="w-full"
                allowClear
              >
                <Option value="oily">Oily</Option>
                <Option value="dry">Dry</Option>
                <Option value="combination">Combination</Option>
                <Option value="sensitive">Sensitive</Option>
                <Option value="normal">Normal</Option>
              </Select>
            </Col>
          </Row>

          {/* Row 2: Advanced Filters (Price & Sort) */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12} lg={6}>
                <Text type="secondary" className="block mb-2 text-xs uppercase font-semibold">Price Range</Text>
                <Space className="w-full">
                  <InputNumber
                    placeholder="Min"
                    value={minPrice}
                    onChange={(value) => setMinPrice(value || undefined)}
                    min={0}
                    className="w-full"
                  />
                  <span className="text-gray-400">-</span>
                  <InputNumber
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(value) => setMaxPrice(value || undefined)}
                    min={0}
                    className="w-full"
                  />
                </Space>
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Text type="secondary" className="block mb-2 text-xs uppercase font-semibold">Sort By</Text>
                <Space.Compact className="w-full">
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-full"
                  >
                    <Option value="createdAt">Date Added</Option>
                    <Option value="name">Name</Option>
                    <Option value="price">Price</Option>
                    <Option value="stockQuantity">Stock</Option>
                  </Select>
                  <Select
                    value={sortOrder}
                    onChange={setSortOrder}
                    style={{ width: 120 }}
                  >
                    <Option value="DESC">Desc</Option>
                    <Option value="ASC">Asc</Option>
                  </Select>
                </Space.Compact>
              </Col>

              <Col xs={24} lg={12}>
                <Text type="secondary" className="block mb-2 text-xs uppercase font-semibold">Startus & Tags</Text>
                <Flex wrap="wrap" gap={4} className="mt-1">
                  <Tag.CheckableTag checked={isFeatured === true} onChange={(c) => setIsFeatured(c ? true : undefined)}>Featured</Tag.CheckableTag>
                  <Tag.CheckableTag checked={isNew === true} onChange={(c) => setIsNew(c ? true : undefined)}>New</Tag.CheckableTag>
                  <Tag.CheckableTag checked={isBestSeller === true} onChange={(c) => setIsBestSeller(c ? true : undefined)}>Best Seller</Tag.CheckableTag>
                  <Tag.CheckableTag checked={requiresPrescription === true} onChange={(c) => setRequiresPrescription(c ? true : undefined)}>Rx Required</Tag.CheckableTag>
                  {(search || categoryId || skinType || isFeatured || isNew || isBestSeller || requiresPrescription || minPrice || maxPrice) && (
                    <Button type="link" size="small" onClick={clearFilters} className="text-red-500 hover:text-red-600 p-0 ml-2">
                      Clear All
                    </Button>
                  )}
                </Flex>
              </Col>
            </Row>
          </div>
        </Space>
      </Card>

      {/* Products Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
            onChange: (newPage) => setPage(newPage),
            position: ['bottomCenter'],
            className: 'py-6'
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <PictureOutlined className="text-4xl text-gray-200 mb-4" />
                <Text type="secondary" className="block mb-4">
                  No products found matching your criteria
                </Text>
                <Link to="/products/add">
                  <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}>
                    Add New Product
                  </Button>
                </Link>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
