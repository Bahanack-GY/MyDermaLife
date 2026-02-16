import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Input, Select, Modal, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdAdd, MdEdit, MdDelete, MdLink } from 'react-icons/md';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSuppliers';
import type { Supplier } from '../services/supplier.service';

const { Search } = Input;

export default function Suppliers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [isActive, setIsActive] = useState<boolean>();

  const { data, isLoading } = useSuppliers({ page, limit, search, country, isActive });
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Supplier',
      content: `Are you sure you want to delete "${name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteSupplier.mutate(id),
    });
  };

  const columns: ColumnsType<Supplier> = [
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
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm">
          {record.contactPerson && <div className="font-medium">{record.contactPerson}</div>}
          {record.email && <div>{record.email}</div>}
          {record.phone && <div>{record.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <div className="text-sm">
          {record.city && record.country ? `${record.city}, ${record.country}` : record.country || '-'}
        </div>
      ),
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (terms) => terms || '-',
    },
    {
      title: 'Lead Time',
      key: 'leadTime',
      render: (_, record) => (record.leadTimeDays ? `${record.leadTimeDays} days` : '-'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<MdLink />}
            onClick={() => navigate(`/suppliers/${record.id}/products`)}
          >
            Products
          </Button>
          <Button type="link" icon={<MdEdit />} onClick={() => navigate(`/suppliers/edit/${record.id}`)}>
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
          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
          <Button type="primary" icon={<MdAdd />} onClick={() => navigate('/suppliers/add')} size="large">
            Add Supplier
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Search
            placeholder="Search suppliers..."
            allowClear
            onSearch={setSearch}
            style={{ width: 300 }}
          />

          <Select placeholder="Filter by Country" style={{ width: 200 }} allowClear onChange={setCountry}>
            <Select.Option value="Cameroon">Cameroon</Select.Option>
            <Select.Option value="Nigeria">Nigeria</Select.Option>
            <Select.Option value="Ghana">Ghana</Select.Option>
          </Select>

          <Select placeholder="Filter by Status" style={{ width: 200 }} allowClear onChange={setIsActive}>
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
            showTotal: (total) => `Total ${total} suppliers`,
          }}
        />
      </Card>
    </div>
  );
}
