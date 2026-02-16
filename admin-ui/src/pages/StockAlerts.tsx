import { Card, Table, Tag, Collapse, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdWarning, MdError } from 'react-icons/md';
import { useStockAlerts } from '../hooks/useInventory';
import type { Stock } from '../services/inventory.service';
import type { Product } from '../services/product.service';

const { Panel } = Collapse;

interface LowStockItem {
  product: Product;
  stock: Stock;
}

interface OutOfStockItem {
  product: Product;
}

export default function StockAlerts() {
  const { data: alerts, isLoading } = useStockAlerts();

  const lowStockColumns: ColumnsType<LowStockItem> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product.name}</div>
          <div className="text-sm text-gray-500">SKU: {record.product.sku}</div>
        </div>
      ),
    },
    {
      title: 'Available',
      key: 'available',
      render: (_, record) => (
        <span className="text-orange-600 font-medium">{record.stock.availableQuantity}</span>
      ),
    },
    {
      title: 'Threshold',
      key: 'threshold',
      render: (_, record) => record.stock.lowStockThreshold,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="orange" icon={<MdWarning />}>Low Stock</Tag>,
    },
  ];

  const outOfStockColumns: ColumnsType<OutOfStockItem> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.product.name}</div>
          <div className="text-sm text-gray-500">SKU: {record.product.sku}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="red" icon={<MdError />}>Out of Stock</Tag>,
    },
  ];

  const totalLowStock = alerts?.reduce((sum, alert) => sum + alert.lowStockProducts.length, 0) || 0;
  const totalOutOfStock =
    alerts?.reduce((sum, alert) => sum + alert.outOfStockProducts.length, 0) || 0;

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Stock Alerts</h1>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Tag color="orange" className="text-base px-4 py-1">
                Low Stock: {totalLowStock}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              <Tag color="red" className="text-base px-4 py-1">
                Out of Stock: {totalOutOfStock}
              </Tag>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card loading={true} />
        ) : alerts && alerts.length > 0 ? (
          <Collapse defaultActiveKey={alerts.map((_, idx) => idx.toString())}>
            {alerts.map((alert, index) => {
              const hasLowStock = alert.lowStockProducts.length > 0;
              const hasOutOfStock = alert.outOfStockProducts.length > 0;

              if (!hasLowStock && !hasOutOfStock) return null;

              return (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{alert.warehouse.name}</span>
                      <div className="flex gap-4">
                        {hasLowStock && (
                          <Tag color="orange">{alert.lowStockProducts.length} Low Stock</Tag>
                        )}
                        {hasOutOfStock && (
                          <Tag color="red">{alert.outOfStockProducts.length} Out of Stock</Tag>
                        )}
                      </div>
                    </div>
                  }
                  key={index.toString()}
                >
                  {hasLowStock && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MdWarning className="text-orange-600" />
                        Low Stock Products
                      </h3>
                      <Table
                        columns={lowStockColumns}
                        dataSource={alert.lowStockProducts}
                        rowKey={(record) => record.stock.id}
                        pagination={false}
                        size="small"
                      />
                    </div>
                  )}

                  {hasOutOfStock && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MdError className="text-red-600" />
                        Out of Stock Products
                      </h3>
                      <Table
                        columns={outOfStockColumns}
                        dataSource={alert.outOfStockProducts}
                        rowKey={(record) => record.product.id}
                        pagination={false}
                        size="small"
                      />
                    </div>
                  )}
                </Panel>
              );
            })}
          </Collapse>
        ) : (
          <Empty description="No stock alerts at the moment" />
        )}
      </Card>
    </div>
  );
}
