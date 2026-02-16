import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectModel(Shipment)
    private shipmentModel: typeof Shipment,
    @InjectModel(Order)
    private orderModel: typeof Order,
    private readonly sequelize: Sequelize,
  ) {}

  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const order = await this.orderModel.findByPk(dto.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const shipment = await this.shipmentModel.create({
      orderId: dto.orderId,
      assignedDriver: dto.assignedDriver,
      trackingNumber: dto.trackingNumber,
      estimatedDelivery: dto.estimatedDelivery,
      notes: dto.notes,
      carrier: 'Lis Course',
    });

    await this.orderModel.update(
      { status: 'processing' },
      { where: { id: dto.orderId } },
    );

    return this.findOne(shipment.id);
  }

  async findAll(query: QueryShipmentDto): Promise<{
    data: Shipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page ? +query.page : 1;
    const limit = query.limit ? +query.limit : 20;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.assignedDriver) {
      where.assignedDriver = query.assignedDriver;
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt[Op.gte] = new Date(query.from);
      if (query.to) where.createdAt[Op.lte] = new Date(query.to + 'T23:59:59');
    }

    const { rows, count } = await this.shipmentModel.findAndCountAll({
      where,
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'status', 'totalAmount', 'shippingCity', 'shippingAddressLine1'] },
        { model: User, as: 'driver', attributes: ['id', 'email'], include: [{ model: UserProfile, attributes: ['firstName', 'lastName'] }] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findMyAssignments(driverId: string, query: QueryShipmentDto): Promise<{
    data: Shipment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ ...query, assignedDriver: driverId });
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentModel.findByPk(id, {
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'driver', attributes: ['id', 'email'], include: [{ model: UserProfile, attributes: ['firstName', 'lastName'] }] },
      ],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    await this.shipmentModel.update(
      {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.assignedDriver !== undefined && { assignedDriver: dto.assignedDriver }),
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
        ...(dto.estimatedDelivery !== undefined && { estimatedDelivery: dto.estimatedDelivery }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.deliveryNotes !== undefined && { deliveryNotes: dto.deliveryNotes }),
        ...(dto.proofOfDeliveryUrl !== undefined && { proofOfDeliveryUrl: dto.proofOfDeliveryUrl }),
      },
      { where: { id } },
    );

    if (dto.status) {
      await this.syncOrderStatus(shipment.orderId, dto.status);
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: string): Promise<Shipment> {
    const shipment = await this.findOne(id);

    const updateData: any = { status };

    if (status === 'in_transit') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await this.shipmentModel.update(updateData, { where: { id } });
    await this.syncOrderStatus(shipment.orderId, status);

    return this.findOne(id);
  }

  async assignDriver(id: string, driverId: string): Promise<Shipment> {
    await this.findOne(id);

    await this.shipmentModel.update(
      { assignedDriver: driverId },
      { where: { id } },
    );

    return this.findOne(id);
  }

  async addProofOfDelivery(id: string, url: string, notes?: string): Promise<Shipment> {
    await this.findOne(id);

    const updateData: any = { proofOfDeliveryUrl: url };
    if (notes !== undefined) {
      updateData.deliveryNotes = notes;
    }

    await this.shipmentModel.update(updateData, { where: { id } });

    return this.findOne(id);
  }

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Status breakdown
    const statuses = ['preparing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];
    const byStatus: Record<string, number> = {};
    for (const status of statuses) {
      byStatus[status] = await this.shipmentModel.count({ where: { status } });
    }

    const totalShipments = Object.values(byStatus).reduce((a, b) => a + b, 0);

    // Time-based counts
    const todayDeliveries = await this.shipmentModel.count({
      where: { status: 'delivered', deliveredAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    const weekDeliveries = await this.shipmentModel.count({
      where: { status: 'delivered', deliveredAt: { [Op.gte]: weekStart } },
    });

    const monthDeliveries = await this.shipmentModel.count({
      where: { status: 'delivered', deliveredAt: { [Op.gte]: monthStart } },
    });

    const todayNewShipments = await this.shipmentModel.count({
      where: { createdAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    // Active deliveries (not delivered or failed)
    const activeDeliveries = await this.shipmentModel.count({
      where: { status: { [Op.in]: ['preparing', 'in_transit', 'out_for_delivery'] } },
    });

    // Unassigned shipments
    const unassigned = await this.shipmentModel.count({
      where: {
        assignedDriver: null,
        status: { [Op.notIn]: ['delivered', 'failed'] },
      },
    });

    // Failed rate
    const failedRate = totalShipments > 0
      ? Number(((byStatus.failed / totalShipments) * 100).toFixed(1))
      : 0;

    // Average delivery time (hours between createdAt and deliveredAt)
    const [avgResult]: any = await this.sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - created_at)) / 3600) as avg_hours
       FROM shipments WHERE status = 'delivered' AND delivered_at IS NOT NULL`,
      { raw: true },
    );
    const avgDeliveryTimeHours = avgResult?.[0]?.avg_hours
      ? Number(Number(avgResult[0].avg_hours).toFixed(1))
      : null;

    // Top drivers (by completed deliveries this month)
    const topDrivers = await this.shipmentModel.findAll({
      attributes: [
        'assignedDriver',
        [fn('COUNT', col('Shipment.id')), 'deliveryCount'],
      ],
      where: {
        status: 'delivered',
        assignedDriver: { [Op.ne]: null },
        deliveredAt: { [Op.gte]: monthStart },
      },
      include: [
        { model: User, as: 'driver', attributes: ['id', 'email'], include: [{ model: UserProfile, attributes: ['firstName', 'lastName'] }] },
      ],
      group: ['assignedDriver', 'driver.id', 'driver->profile.id'],
      order: [[literal('COUNT("Shipment"."id")'), 'DESC']],
      limit: 5,
      raw: false,
    });

    // Recent deliveries (last 5 completed)
    const recentDeliveries = await this.shipmentModel.findAll({
      where: { status: 'delivered' },
      include: [
        { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'totalAmount', 'shippingCity'] },
        { model: User, as: 'driver', attributes: ['id', 'email'], include: [{ model: UserProfile, attributes: ['firstName', 'lastName'] }] },
      ],
      order: [['deliveredAt', 'DESC']],
      limit: 5,
    });

    return {
      overview: {
        totalShipments,
        activeDeliveries,
        unassigned,
        failedRate,
        avgDeliveryTimeHours,
      },
      byStatus,
      period: {
        todayNewShipments,
        todayDeliveries,
        weekDeliveries,
        monthDeliveries,
      },
      topDrivers: topDrivers.map((d: any) => ({
        driver: d.driver,
        deliveryCount: Number(d.getDataValue('deliveryCount')),
      })),
      recentDeliveries,
    };
  }

  async getDriverStats(driverId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const driverWhere = { assignedDriver: driverId };

    const totalAssigned = await this.shipmentModel.count({ where: driverWhere });

    const completed = await this.shipmentModel.count({
      where: { ...driverWhere, status: 'delivered' },
    });

    const active = await this.shipmentModel.count({
      where: { ...driverWhere, status: { [Op.in]: ['preparing', 'in_transit', 'out_for_delivery'] } },
    });

    const failed = await this.shipmentModel.count({
      where: { ...driverWhere, status: 'failed' },
    });

    const todayCompleted = await this.shipmentModel.count({
      where: { ...driverWhere, status: 'delivered', deliveredAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    const monthCompleted = await this.shipmentModel.count({
      where: { ...driverWhere, status: 'delivered', deliveredAt: { [Op.gte]: monthStart } },
    });

    const successRate = totalAssigned > 0
      ? Number(((completed / totalAssigned) * 100).toFixed(1))
      : 0;

    // Average delivery time for this driver
    const [avgResult]: any = await this.sequelize.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - created_at)) / 3600) as avg_hours
       FROM shipments WHERE status = 'delivered' AND delivered_at IS NOT NULL AND assigned_driver = :driverId`,
      { replacements: { driverId }, raw: true },
    );
    const avgDeliveryTimeHours = avgResult?.[0]?.avg_hours
      ? Number(Number(avgResult[0].avg_hours).toFixed(1))
      : null;

    // Pending pickups (assigned but not yet picked up)
    const pendingPickups = await this.shipmentModel.count({
      where: { ...driverWhere, status: 'preparing' },
    });

    return {
      totalAssigned,
      completed,
      active,
      failed,
      pendingPickups,
      successRate,
      avgDeliveryTimeHours,
      today: { completed: todayCompleted },
      month: { completed: monthCompleted },
    };
  }

  async delete(id: string): Promise<void> {
    const shipment = await this.findOne(id);
    await shipment.destroy();
  }

  private async syncOrderStatus(orderId: string, shipmentStatus: string): Promise<void> {
    const updateData: any = {};

    if (shipmentStatus === 'in_transit') {
      updateData.status = 'shipped';
      updateData.shippedAt = new Date();
    } else if (shipmentStatus === 'delivered') {
      updateData.status = 'delivered';
      updateData.deliveredAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await this.orderModel.update(updateData, { where: { id: orderId } });
    }
  }
}
