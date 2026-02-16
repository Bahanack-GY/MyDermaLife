import { useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Tag,
  Input,
  Select,
  Rate,
  Modal,
  Descriptions,
  Popconfirm,
  Badge,
  Empty,
  Avatar,
} from 'antd';
import {
  StarOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  UserOutlined,
  ShoppingOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAdminReviews, useModerateReview, useDeleteReview } from '../hooks/useReviews';
import type { Review, ReviewStatus } from '../services/review.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

dayjs.extend(relativeTime);

const statusColors: Record<ReviewStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

const statusLabels: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function ProductReviews() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<ReviewStatus | undefined>('pending');
  const [rating, setRating] = useState<number | undefined>();
  const [search, setSearch] = useState('');

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { data, isLoading, refetch } = useAdminReviews({
    page,
    limit,
    status,
    rating,
  });

  const { mutate: moderateReview, isPending: isModerating } = useModerateReview();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

  const handleModerate = (reviewId: string, newStatus: 'approved' | 'rejected') => {
    moderateReview({ id: reviewId, data: { status: newStatus } });
  };

  const handleDelete = (reviewId: string) => {
    deleteReview(reviewId);
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setViewModalOpen(true);
  };

  const clearFilters = () => {
    setStatus(undefined);
    setRating(undefined);
    setSearch('');
    setPage(1);
  };

  const columns: ColumnsType<Review> = [
    {
      title: 'Product',
      key: 'product',
      width: 250,
      render: (_: any, record: Review) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.product?.name}</Text>
          <Space size={4}>
            <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
            {record.isVerifiedPurchase && (
              <Tag icon={<SafetyOutlined />} color="blue" style={{ fontSize: 11 }}>
                Verified
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Review',
      key: 'review',
      render: (_: any, record: Review) => (
        <Space direction="vertical" size={0} style={{ maxWidth: 400 }}>
          <Text strong>{record.title}</Text>
          <Paragraph
            ellipsis={{ rows: 2, expandable: false }}
            style={{ marginBottom: 0 }}
            type="secondary"
          >
            {record.reviewText || 'No review text'}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_: any, record: Review) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text>{record.user?.email}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(record.createdAt).format('MMM D, YYYY')}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReviewStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Helpful',
      dataIndex: 'helpfulCount',
      key: 'helpfulCount',
      width: 100,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Review) => (
        <Space size="small" wrap>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewReview(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleModerate(record.id, 'approved')}
                loading={isModerating}
                style={{ color: '#52c41a' }}
              >
                Approve
              </Button>
              <Button
                type="text"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleModerate(record.id, 'rejected')}
                loading={isModerating}
                danger
              >
                Reject
              </Button>
            </>
          )}
          <Popconfirm
            title="Delete this review?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              loading={isDeleting}
              danger
            />
          </Popconfirm>
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
            Product Reviews
          </Title>
          <Text type="secondary">
            Moderate and manage customer product reviews
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm rounded-xl">
          <Space>
            <Avatar style={{ backgroundColor: '#faad14' }} icon={<StarOutlined />} />
            <div>
              <Text type="secondary">Pending Reviews</Text>
              <Title level={3} style={{ marginBottom: 0 }}>
                {status === 'pending' ? data?.total || 0 : '...'}
              </Title>
            </div>
          </Space>
        </Card>
        <Card className="shadow-sm rounded-xl">
          <Space>
            <Avatar style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} />
            <div>
              <Text type="secondary">Approved</Text>
              <Title level={3} style={{ marginBottom: 0 }}>
                {status === 'approved' ? data?.total || 0 : '...'}
              </Title>
            </div>
          </Space>
        </Card>
        <Card className="shadow-sm rounded-xl">
          <Space>
            <Avatar style={{ backgroundColor: '#ff4d4f' }} icon={<CloseCircleOutlined />} />
            <div>
              <Text type="secondary">Rejected</Text>
              <Title level={3} style={{ marginBottom: 0 }}>
                {status === 'rejected' ? data?.total || 0 : '...'}
              </Title>
            </div>
          </Space>
        </Card>
        <Card className="shadow-sm rounded-xl">
          <Space>
            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<ShoppingOutlined />} />
            <div>
              <Text type="secondary">Total Reviews</Text>
              <Title level={3} style={{ marginBottom: 0 }}>
                {data?.total || 0}
              </Title>
            </div>
          </Space>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm rounded-xl">
        <Space direction="vertical" size="large" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              placeholder="Filter by status"
              value={status}
              onChange={setStatus}
              size="large"
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>

            <Select
              placeholder="Filter by rating"
              value={rating}
              onChange={setRating}
              size="large"
              allowClear
            >
              <Option value={5}>5 Stars</Option>
              <Option value={4}>4 Stars</Option>
              <Option value={3}>3 Stars</Option>
              <Option value={2}>2 Stars</Option>
              <Option value={1}>1 Star</Option>
            </Select>

            <Input
              placeholder="Search by product or user..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="large"
              allowClear
            />
          </div>

          {(status || rating || search) && (
            <Button type="link" onClick={clearFilters} className="p-0">
              Clear all filters
            </Button>
          )}
        </Space>
      </Card>

      {/* Reviews Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reviews`,
            onChange: (newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            },
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No reviews found"
              />
            ),
          }}
        />
      </Card>

      {/* Review Detail Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined />
            <span>Review Details</span>
          </Space>
        }
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedReview(null);
        }}
        width={700}
        footer={
          selectedReview?.status === 'pending'
            ? [
                <Button
                  key="reject"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    handleModerate(selectedReview.id, 'rejected');
                    setViewModalOpen(false);
                  }}
                  loading={isModerating}
                >
                  Reject
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    handleModerate(selectedReview.id, 'approved');
                    setViewModalOpen(false);
                  }}
                  loading={isModerating}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Approve
                </Button>,
              ]
            : [
                <Button
                  key="close"
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedReview(null);
                  }}
                >
                  Close
                </Button>,
              ]
        }
      >
        {selectedReview && (
          <div className="space-y-4">
            {/* Product Info */}
            <Card size="small" title="Product">
              <Space direction="vertical" className="w-full">
                <Text strong>{selectedReview.product?.name}</Text>
                <Text type="secondary">{selectedReview.product?.slug}</Text>
              </Space>
            </Card>

            {/* Review Content */}
            <Card size="small" title="Review">
              <Space direction="vertical" className="w-full" size="middle">
                <div>
                  <Space>
                    <Rate disabled value={selectedReview.rating} />
                    <Text strong>({selectedReview.rating}/5)</Text>
                  </Space>
                </div>
                <div>
                  <Title level={5}>{selectedReview.title}</Title>
                  <Paragraph>{selectedReview.reviewText || 'No review text provided'}</Paragraph>
                </div>
              </Space>
            </Card>

            {/* Details */}
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Status" span={2}>
                <Tag color={statusColors[selectedReview.status]}>
                  {statusLabels[selectedReview.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User">
                {selectedReview.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Verified Purchase">
                {selectedReview.isVerifiedPurchase ? (
                  <Tag icon={<SafetyOutlined />} color="success">
                    Yes
                  </Tag>
                ) : (
                  <Tag color="default">No</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Helpful Count">
                <Badge count={selectedReview.helpfulCount} showZero />
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedReview.createdAt).format('MMM D, YYYY h:mm A')}
              </Descriptions.Item>
              {selectedReview.moderatedAt && (
                <>
                  <Descriptions.Item label="Moderated At" span={2}>
                    {dayjs(selectedReview.moderatedAt).format('MMM D, YYYY h:mm A')}
                  </Descriptions.Item>
                </>
              )}
              {selectedReview.orderId && (
                <Descriptions.Item label="Order ID" span={2}>
                  <Text code>{selectedReview.orderId}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
