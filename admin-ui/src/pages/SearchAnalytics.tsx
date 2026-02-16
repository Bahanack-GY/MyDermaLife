import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Statistic, Select, Space, Button, Tag, Empty, Switch, Divider } from 'antd';
import {
  SearchOutlined,
  WarningOutlined,
  ReloadOutlined,
  FireOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSearchAnalytics, useSearchLogs } from '../hooks/useSearchAnalytics';
import type { SearchTerm, SearchLogEntry } from '../services/searchAnalytics.service';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const { Title, Text } = Typography;
const { Option } = Select;

dayjs.extend(relativeTime);

export default function SearchAnalytics() {
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(20);

  // Search logs state
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit, setLogsLimit] = useState(25);
  const [showZeroResultsOnly, setShowZeroResultsOnly] = useState(false);

  const { data, isLoading, refetch } = useSearchAnalytics({ days, limit });
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useSearchLogs({
    page: logsPage,
    limit: logsLimit,
    zeroResults: showZeroResultsOnly || undefined,
  });

  // Debug logging
  if (data) {
    console.log('[SearchAnalytics] Full data:', data);
    console.log('[SearchAnalytics] Top searches:', data.topSearches);
    console.log('[SearchAnalytics] First top search:', data.topSearches[0]);
  }

  const topSearchesColumns: ColumnsType<SearchTerm> = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (_: any, __: SearchTerm, index: number) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Search Term',
      dataIndex: 'query',
      key: 'query',
      render: (query: string) => (
        <Space>
          <SearchOutlined className="text-gray-400" />
          <Text strong>{query}</Text>
        </Space>
      ),
    },
    {
      title: 'Search Count',
      dataIndex: 'count',
      key: 'count',
      width: 150,
      render: (count: number) => (
        <Tag color="blue" variant="filled">
          {count} searches
        </Tag>
      ),
    },
    {
      title: 'Avg Results',
      dataIndex: 'avgResults',
      key: 'avgResults',
      width: 150,
      render: (avg: number) => {
        const color = avg === 0 ? 'red' : avg < 5 ? 'orange' : 'green';
        return (
          <Tag color={color} variant="filled">
            {avg.toFixed(1)} results
          </Tag>
        );
      },
    },
  ];

  const searchLogsColumns: ColumnsType<SearchLogEntry> = [
    {
      title: 'Search Query',
      dataIndex: 'searchQuery',
      key: 'searchQuery',
      render: (searchQuery: string) => (
        <Space>
          <SearchOutlined className="text-gray-400" />
          <Text strong>{searchQuery}</Text>
        </Space>
      ),
    },
    {
      title: 'Results',
      dataIndex: 'resultsCount',
      key: 'resultsCount',
      width: 120,
      render: (count: number) => {
        const color = count === 0 ? 'red' : count < 5 ? 'orange' : 'green';
        return (
          <Tag color={color} variant="filled">
            {count} results
          </Tag>
        );
      },
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: any) => {
        if (!user) {
          return (
            <Text type="secondary" italic>
              <UserOutlined /> Guest
            </Text>
          );
        }
        return (
          <Space>
            <UserOutlined className="text-gray-400" />
            <div>
              <Text>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}</Text>
              {user.firstName && user.lastName && (
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined className="text-gray-400" />
          <div>
            <Text>{dayjs(date).format('MMM D, YYYY')}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(date).format('h:mm A')} ({dayjs(date).fromNow()})
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
  ];

  const zeroResultsColumns: ColumnsType<SearchTerm> = [
    {
      title: 'Search Term',
      dataIndex: 'query',
      key: 'query',
      render: (query: string) => (
        <Space>
          <WarningOutlined className="text-orange-500" />
          <Text>{query}</Text>
        </Space>
      ),
    },
    {
      title: 'Search Count',
      dataIndex: 'count',
      key: 'count',
      width: 150,
      render: (count: number) => (
        <Tag color="orange" variant="filled">
          {count} searches
        </Tag>
      ),
    },
    {
      title: 'Impact',
      key: 'impact',
      width: 120,
      render: (_: any, record: SearchTerm) => {
        const impact = record.count >= 5 ? 'High' : record.count >= 3 ? 'Medium' : 'Low';
        const color = impact === 'High' ? 'red' : impact === 'Medium' ? 'orange' : 'default';
        return <Tag color={color}>{impact}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="font-serif !mb-1">
            Search Analytics
          </Title>
          <Text type="secondary">
            Analyze user search behavior and identify catalog gaps
          </Text>
        </div>
        <Space>
          <Select
            value={days}
            onChange={setDays}
            style={{ width: 150 }}
            size="large"
          >
            <Option value={7}>Last 7 days</Option>
            <Option value={14}>Last 14 days</Option>
            <Option value={30}>Last 30 days</Option>
            <Option value={90}>Last 90 days</Option>
          </Select>
          <Select
            value={limit}
            onChange={setLimit}
            style={{ width: 120 }}
            size="large"
          >
            <Option value={10}>Top 10</Option>
            <Option value={20}>Top 20</Option>
            <Option value={50}>Top 50</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
            size="large"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Summary Stats */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="shadow-sm rounded-xl">
            <Statistic
              title="Total Searches"
              value={data?.totalSearches || 0}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="shadow-sm rounded-xl">
            <Statistic
              title="Unique Search Terms"
              value={data?.topSearches.length || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="shadow-sm rounded-xl">
            <Statistic
              title="Zero Result Searches"
              value={data?.zeroResultSearches.length || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={
                data?.zeroResultSearches.length ? (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    catalog gaps
                  </Text>
                ) : null
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Top Searches */}
      <Card
        variant="outlined"
        className="shadow-sm rounded-xl"
        title={
          <Space>
            <FireOutlined style={{ color: '#ff7a45' }} />
            <span>Top Searches</span>
          </Space>
        }
        extra={
          <Text type="secondary">
            Last {days} days
          </Text>
        }
      >
        <Table
          columns={topSearchesColumns}
          dataSource={data?.topSearches || []}
          loading={isLoading}
          rowKey={(record) => record.query}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `${total} search terms`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No search data yet"
              />
            ),
          }}
        />
      </Card>

      {/* Zero Results Searches */}
      {data?.zeroResultSearches && data.zeroResultSearches.length > 0 && (
        <Card
          variant="outlined"
          className="shadow-sm rounded-xl"
          title={
            <Space>
              <WarningOutlined style={{ color: '#ff7a45' }} />
              <span>Searches with Zero Results</span>
            </Space>
          }
          extra={
            <Tag color="orange">
              {data.zeroResultSearches.length} catalog gaps
            </Tag>
          }
        >
          <div className="mb-4">
            <Text type="secondary">
              These searches returned no results. Consider adding products for these terms to improve customer experience.
            </Text>
          </div>
          <Table
            columns={zeroResultsColumns}
            dataSource={data.zeroResultSearches}
            loading={isLoading}
            rowKey={(record) => `zero-${record.query}`}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `${total} missed opportunities`,
            }}
          />
        </Card>
      )}

      {/* Search Logs */}
      <Card
        variant="outlined"
        className="shadow-sm rounded-xl"
        title={
          <Space>
            <FileSearchOutlined style={{ color: '#1890ff' }} />
            <span>Recent Search Queries</span>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">Show zero results only:</Text>
            <Switch
              checked={showZeroResultsOnly}
              onChange={(checked) => {
                setShowZeroResultsOnly(checked);
                setLogsPage(1); // Reset to first page
              }}
            />
            <Divider type="vertical" />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetchLogs()}
              loading={logsLoading}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={searchLogsColumns}
          dataSource={logsData?.data || []}
          loading={logsLoading}
          rowKey="id"
          pagination={{
            current: logsPage,
            pageSize: logsLimit,
            total: logsData?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} search queries`,
            onChange: (page, pageSize) => {
              setLogsPage(page);
              setLogsLimit(pageSize);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  showZeroResultsOnly
                    ? "No zero-result searches found"
                    : "No search queries yet"
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
