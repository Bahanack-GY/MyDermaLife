import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Tag,
  Card,
  Image,
  Popconfirm,
  Typography,
  Input,
  Flex,
  theme,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  RightOutlined,
  DownOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCategories, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../services/category.service';
import { API_CONFIG } from '../config/api.config';

const { Title, Text } = Typography;

export default function Categories() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const { data: categoriesData, isLoading } = useCategories();
  const { mutate: deleteCategory } = useDeleteCategory();

  // Transform categories to tree structure for table
  const transformToTreeData = (categories: Category[]) => {
    return categories.map(parent => ({
      ...parent,
      children: parent.subcategories?.map(sub => ({
        ...sub,
        parentCategoryId: parent.id,
        // Mark as child for styling
        isChild: true,
      })) || []
    }));
  };

  const treeData = categoriesData ? transformToTreeData(categoriesData) : [];

  const filteredCategories = treeData.filter(category => {
    const matchesParent = category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.slug.toLowerCase().includes(search.toLowerCase());

    const matchesChild = category.children?.some((child: any) =>
      child.name.toLowerCase().includes(search.toLowerCase()) ||
      child.slug.toLowerCase().includes(search.toLowerCase())
    );

    return matchesParent || matchesChild;
  });

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const handleAddSubcategory = (parentId: string) => {
    navigate(`/categories/new?parent=${parentId}`);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Category',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (name: string, record: any) => (
        <Space size="middle">
          {record.imageUrl ? (
            <Image
              src={`${API_CONFIG.BASE_URL}${record.imageUrl}`}
              alt={name}
              width={48}
              height={48}
              style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #f0f0f0' }}
              preview={{ maskClassName: 'rounded-lg' }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {record.isChild ? (
                <FolderOpenOutlined style={{ fontSize: 20, color: '#d9d9d9' }} />
              ) : (
                <FolderOutlined style={{ fontSize: 20, color: '#d9d9d9' }} />
              )}
            </div>
          )}
          <div className="flex flex-col">
            <Text strong className="text-base">
              {name}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {record.slug}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Subcategories',
      key: 'subcategories',
      width: 120,
      render: (_: any, record: any) => {
        if (record.isChild) return null;
        const count = record.children?.length || 0;
        return count > 0 ? (
          <Tag bordered={false} color="blue">{count}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <Text type="secondary" ellipsis={{ tooltip: desc }}>
          {desc || '-'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'} bordered={false}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          {!record.isChild && (
            <Tooltip title="Add Subcategory">
              <Button
                type="text"
                icon={<PlusCircleOutlined />}
                onClick={() => handleAddSubcategory(record.id)}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
          <Tooltip title="View Products">
            <Link to={`/products?category=${record.id}`}>
              <Button type="text" icon={<ShoppingOutlined />} style={{ color: '#1890ff' }} />
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <Link to={`/categories/${record.id}/edit`}>
              <Button type="text" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            description={
              !record.isChild && record.children && record.children.length > 0
                ? 'This category has subcategories. Are you sure you want to delete it?'
                : 'This action cannot be undone.'
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <div>
          <Title level={2} className="font-serif !mb-0">
            Categories
          </Title>
          <Text type="secondary">
            Manage product categories and subcategories
          </Text>
        </div>
        <Link to="/categories/new">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ backgroundColor: '#9B563A', borderColor: '#9B563A' }}
          >
            Add Category
          </Button>
        </Link>
      </Flex>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm rounded-xl">
        <Space size="middle" wrap>
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-xl">
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={isLoading}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            defaultExpandAllRows: false,
            indentSize: 30,
            expandIcon: ({ expanded, onExpand, record }) => {
              // Only show expand icon for parent categories with children
              if (record.children && record.children.length > 0) {
                return expanded ? (
                  <DownOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={{ cursor: 'pointer', marginRight: 8, color: '#999' }}
                  />
                ) : (
                  <RightOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={{ cursor: 'pointer', marginRight: 8, color: '#999' }}
                  />
                );
              }
              // Return empty space for categories without children to maintain alignment
              return <span style={{ marginRight: 20 }} />;
            },
          }}
          rowClassName={(record) => record.isChild ? 'bg-gray-50' : ''}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
          }}
        />
      </Card>
    </div>
  );
}
