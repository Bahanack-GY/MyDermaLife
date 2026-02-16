import { Card, Row, Col, Select, Typography, Progress, Button, List } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MoreOutlined } from '@ant-design/icons';
import {
  MdShoppingCart,
  MdReceipt,
  MdPeople,
} from 'react-icons/md';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Dashboard() {
  // Format XAF currency
  const formatXAF = (value: any) => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M XAF`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K XAF`;
      }
      return `${value.toLocaleString()} XAF`;
    }
    return `${value}`;
  };

  // Revenue Analytics Data (in XAF)
  const revenueData = [
    { date: '12 Aug', revenue: 5100000, orders: 4200 },
    { date: '13 Aug', revenue: 6120000, orders: 5100 },
    { date: '14 Aug', revenue: 7200000, orders: 6800 },
    { date: '15 Aug', revenue: 6900000, orders: 8500 },
    { date: '16 Aug', revenue: 8712600, orders: 7200 },
    { date: '17 Aug', revenue: 8280000, orders: 6500 },
    { date: '18 Aug', revenue: 7500000, orders: 5800 },
    { date: '19 Aug', revenue: 7920000, orders: 6200 },
  ];

  // Top Categories Data (in XAF)
  const categoriesData = [
    { name: 'Consultations', value: 720000000, color: '#9B563A' },
    { name: 'Skincare Products', value: 570000000, color: '#FDDDCB' },
    { name: 'Treatments', value: 450000000, color: '#E8B89C' },
    { name: 'Supplements', value: 300000000, color: '#F5E6DD' },
  ];

  // Active Users by Location
  const activeUsers = [
    { country: 'United States', percentage: 36, color: '#9B563A' },
    { country: 'United Kingdom', percentage: 24, color: '#B36B4F' },
    { country: 'Canada', percentage: 17.5, color: '#FDDDCB' },
    { country: 'Australia', percentage: 15, color: '#E8B89C' },
  ];

  // Conversion Funnel Data
  const conversionData = [
    { stage: 'Product Views', value: 25000, change: '+9%', positive: true },
    { stage: 'Add to Cart', value: 12000, change: '+6%', positive: true },
    { stage: 'Proceed to Checkout', value: 8500, change: '+4%', positive: true },
    { stage: 'Completed Purchases', value: 6200, change: '+7%', positive: true },
    { stage: 'Abandoned Carts', value: 3000, change: '-5%', positive: false },
  ];

  // Traffic Sources
  const trafficSources = [
    { source: 'Direct Traffic', percentage: 40 },
    { source: 'Organic Search', percentage: 30 },
    { source: 'Social Media', percentage: 15 },
    { source: 'Referral Traffic', percentage: 10 },
    { source: 'Email Campaigns', percentage: 5 },
  ];

  const totalSales = categoriesData.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="h-full rounded-2xl shadow-sm bg-[#FDDDCB]">
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-[#9B563A]/80 text-sm">Total Sales</Text>
                <Title level={2} style={{ color: '#9B563A', marginTop: 0, marginBottom: 0 }}>590M XAF</Title>
              </div>
              <div className="bg-[#9B563A] p-3 rounded-xl">
                <MdShoppingCart className="text-white text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center text-green-700 font-semibold text-sm">
                <ArrowUpOutlined className="mr-1" /> +3.34%
              </span>
              <Text className="text-[#9B563A]/70 text-xs">vs last week</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="h-full rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-sm">Total Orders</Text>
                <Title level={2} style={{ marginTop: 0, marginBottom: 0 }}>58,375</Title>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <MdReceipt className="text-gray-400 text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center text-red-500 font-semibold text-sm">
                <ArrowDownOutlined className="mr-1" /> -2.89%
              </span>
              <Text type="secondary" className="text-xs">vs last week</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="h-full rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-sm">Total Visitors</Text>
                <Title level={2} style={{ marginTop: 0, marginBottom: 0 }}>237,782</Title>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <MdPeople className="text-gray-400 text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center text-green-500 font-semibold text-sm">
                <ArrowUpOutlined className="mr-1" /> +8.02%
              </span>
              <Text type="secondary" className="text-xs">vs last week</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue Analytics */}
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm"
        title={<span className="font-serif text-xl">Revenue Analytics</span>}
        extra={
          <Select defaultValue="8days" style={{ width: 120 }}>
            <Option value="8days">Last 8 Days</Option>
            <Option value="30days">Last 30 Days</Option>
          </Select>
        }
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <div className="flex items-center gap-6 mb-4">
              <div>
                <Text type="secondary" className="block text-xs">Revenue</Text>
                <Text strong className="text-2xl">8.7M XAF</Text>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-[#9B563A] mr-2"></div> Revenue</span>
                <span className="flex items-center text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-[#FDDDCB] mr-2"></div> Orders</span>
              </div>
            </div>
          </Col>
          <Col span={24}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => formatXAF(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#9B563A"
                    strokeWidth={3}
                    dot={{ fill: '#9B563A', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#FDDDCB"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#FDDDCB', r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Active Users */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            className="h-full rounded-2xl shadow-sm"
            title={<span className="font-serif text-lg">Active Users</span>}
            extra={<Button type="text" icon={<MoreOutlined />} />}
          >
            <div className="mb-6">
              <Title level={2} style={{ margin: 0 }}>2,758</Title>
              <Text type="secondary" className="text-xs">Users</Text>
              <div className="flex items-center text-green-500 text-xs mt-1">
                <ArrowUpOutlined className="mr-1" /> +8.02% from last month
              </div>
            </div>

            <div className="space-y-4">
              {activeUsers.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <Text type="secondary">{item.country}</Text>
                    <Text strong>{item.percentage}%</Text>
                  </div>
                  <Progress
                    percent={item.percentage}
                    showInfo={false}
                    strokeColor={item.color}
                    trailColor="#f5f5f5"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Conversion Rate */}
        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]} className="h-full">
            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="h-full rounded-2xl shadow-sm"
                title={<span className="font-serif text-lg">Conversion Rate</span>}
                extra={<Button size="small" className="bg-[#9B563A] text-white border-none hover:bg-[#7A4429]">This Week</Button>}
              >
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData} layout="horizontal">
                      <XAxis dataKey="stage" hide />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="value" fill="#9B563A" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-5 gap-1 mt-4 text-center">
                  {conversionData.map((d, i) => (
                    <div key={i}>
                      <div className="text-[10px] text-gray-500 leading-tight mb-1 h-8 overflow-hidden">{d.stage}</div>
                      <div className={`text-[10px] font-bold ${d.positive ? 'text-green-500' : 'text-red-500'}`}>{d.change}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                bordered={false}
                className="h-full rounded-2xl shadow-sm"
                title={<span className="font-serif text-lg">Top Categories</span>}
                extra={<Button type="link" className="text-[#9B563A] p-0">See All</Button>}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => formatXAF(val)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-gray-400 text-xs">Total Sales</span>
                      <span className="font-bold text-gray-800">{(totalSales / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>

                  <div className="w-full mt-4 space-y-2">
                    {categoriesData.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                          <Text type="secondary">{cat.name}</Text>
                        </div>
                        <Text strong>{(cat.value / 1000000).toFixed(1)}M</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Traffic Sources */}
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm"
        title={<span className="font-serif text-xl">Traffic Sources</span>}
        extra={<Button type="text" icon={<MoreOutlined />} />}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="source" width={110} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f9f9f9' }} formatter={(val) => `${val}%`} />
                  <Bar dataKey="percentage" fill="#9B563A" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <List
              dataSource={trafficSources}
              renderItem={(item) => (
                <List.Item className="border-b-0 py-3">
                  <List.Item.Meta
                    avatar={<div className="w-2 h-2 rounded-full bg-[#9B563A] mt-2"></div>}
                    title={<Text className="text-gray-600">{item.source}</Text>}
                  />
                  <div className="text-lg font-bold">{item.percentage}%</div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}
