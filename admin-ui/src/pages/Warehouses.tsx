import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Select, Modal, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useWarehouses, useDeleteWarehouse } from '../hooks/useWarehouses';
import type { Warehouse } from '../services/warehouse.service';

export default function Warehouses() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [country, setCountry] = useState<string>();
  const [isActive, setIsActive] = useState<boolean>();

  const { data, isLoading } = useWarehouses({ page, limit, country, isActive });
  const deleteWarehouse = useDeleteWarehouse();

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Warehouse',
      content: `Are you sure you want to delete "${name}"? This action cannot be undone if there is no stock in this warehouse.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteWarehouse.mutate(id),
    });
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => `${record.city}, ${record.country}`,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm">
          {record.email && <div>{record.email}</div>}
          {record.phone && <div>{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Stock Summary',
      key: 'stock',
      render: (_, record) =>
        record.stockSummary ? (
          <div className="text-sm">
            <div>Products: {record.stockSummary.totalProducts}</div>
            <div>Quantity: {record.stockSummary.totalQuantity}</div>
            {record.stockSummary.lowStockCount > 0 && (
              <div className="text-orange-600">Low Stock: {record.stockSummary.lowStockCount}</div>
            )}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'Inactive'}</Tag>
          {record.isDefault && <Tag color="blue">Default</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<MdEdit />}
            onClick={() => navigate(`/warehouses/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<MdDelete />}
            onClick={() => handleDelete(record.id, record.name)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Warehouses</h1>
          <Button
            type="primary"
            icon={<MdAdd />}
            onClick={() => navigate('/warehouses/add')}
            size="large"
          >
            Add Warehouse
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Select
            placeholder="Filter by Country"
            style={{ width: 200 }}
            allowClear
            onChange={setCountry}
          >
            <Select.Option value="Cameroon">Cameroon</Select.Option>
            <Select.Option value="Nigeria">Nigeria</Select.Option>
            <Select.Option value="Ghana">Ghana</Select.Option>
          </Select>

          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            allowClear
            onChange={setIsActive}
          >
            <Select.Option value={true}>Active</Select.Option>
            <Select.Option value={false}>Inactive</Select.Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta?.total || 0,
            onChange: setPage,
            showTotal: (total) => `Total ${total} warehouses`,
          }}
        />
      </Card>
    </div>
  );
}
