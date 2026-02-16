import { useState } from 'react';
import { Table, Card, Select, DatePicker, Tag, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useStockMovements } from '../hooks/useInventory';
import { useWarehouses } from '../hooks/useWarehouses';
import type { StockMovement } from '../services/inventory.service';

const { RangePicker } = DatePicker;

const movementTypeColors: Record<string, string> = {
  purchase_order_received: 'green',
  sale: 'red',
  return: 'orange',
  adjustment: 'blue',
  transfer_in: 'cyan',
  transfer_out: 'purple',
};

const movementTypeLabels: Record<string, string> = {
  purchase_order_received: 'PO Received',
  sale: 'Sale',
  return: 'Return',
  adjustment: 'Adjustment',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
};

export default function StockMovements() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [warehouseId, setWarehouseId] = useState<string>();
  const [movementType, setMovementType] = useState<string>();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  const { data, isLoading } = useStockMovements({
    page,
    limit,
    warehouseId,
    movementType,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
  });
  const { data: warehousesData } = useWarehouses({ limit: 1000 });

  const columns: ColumnsType<StockMovement> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 150,
      render: (type) => (
        <Tag color={movementTypeColors[type]}>{movementTypeLabels[type] || type}</Tag>
      ),
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product?.name}</div>
          <div className="text-sm text-gray-500">SKU: {record.product?.sku}</div>
        </div>
      ),
    },
    {
      title: 'Warehouse',
      key: 'warehouse',
      render: (_, record) => record.warehouse?.name || '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (qty, record) => {
        const isIncoming = ['purchase_order_received', 'return', 'transfer_in'].includes(
          record.movementType
        );
        return (
          <span className={isIncoming ? 'text-green-600' : 'text-red-600'}>
            {isIncoming ? '+' : '-'}
            {Math.abs(qty)}
          </span>
        );
      },
    },
    {
      title: 'Reference',
      key: 'reference',
      render: (_, record) =>
        record.referenceId ? (
          <div>
            <div className="text-sm">{record.referenceType}</div>
            <div className="text-xs text-gray-500">{record.referenceId.substring(0, 8)}...</div>
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Movement History</h1>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Warehouse"
                style={{ width: '100%' }}
                allowClear
                onChange={setWarehouseId}
              >
                {warehousesData?.data.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by Movement Type"
                style={{ width: '100%' }}
                allowClear
                onChange={setMovementType}
              >
                <Select.Option value="purchase_order_received">PO Received</Select.Option>
                <Select.Option value="sale">Sale</Select.Option>
                <Select.Option value="return">Return</Select.Option>
                <Select.Option value="adjustment">Adjustment</Select.Option>
                <Select.Option value="transfer_in">Transfer In</Select.Option>
                <Select.Option value="transfer_out">Transfer Out</Select.Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
                  } else {
                    setDateRange(undefined);
                  }
                }}
              />
            </Col>
          </Row>
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
            showTotal: (total) => `Total ${total} movements`,
          }}
        />
      </Card>
    </div>
  );
}
