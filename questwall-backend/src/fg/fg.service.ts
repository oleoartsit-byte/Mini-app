import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FgApiService } from './fg-api.service';
import {
  FgOrderData,
  FgOrderQueryParams,
  LocalFgOrderDto,
  SyncResult,
} from './dto/fg-order.dto';

@Injectable()
export class FgService {
  private readonly logger = new Logger(FgService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fgApi: FgApiService,
  ) {}

  /**
   * 检查 FG 服务是否可用
   */
  isAvailable(): boolean {
    return this.fgApi.isAvailable();
  }

  /**
   * 从 FG API 获取订单列表
   */
  async getOrdersFromFg(params: FgOrderQueryParams = {}) {
    const response = await this.fgApi.getOrders(params);
    if (!response) {
      return { success: false, message: 'FG API 请求失败', orders: [] };
    }

    return {
      success: true,
      message: `获取到 ${response.data.count} 个订单`,
      orders: response.data.list,
      pagination: response.data.pagination,
      total: response.data.count,
    };
  }

  /**
   * 从 FG API 获取单个订单详情
   */
  async getOrderFromFg(orderId: number) {
    const response = await this.fgApi.getOrder(orderId);
    if (!response) {
      return { success: false, message: 'FG API 请求失败', order: null };
    }

    return {
      success: true,
      message: '获取订单成功',
      order: response.data,
    };
  }

  /**
   * 同步 FG 订单到本地数据库
   */
  async syncOrderToLocal(fgOrder: FgOrderData): Promise<{ success: boolean; message: string }> {
    try {
      // 解析创建时间
      let fgCreatedAt: Date | undefined;
      if (fgOrder.created_timestamp) {
        fgCreatedAt = new Date(fgOrder.created_timestamp * 1000);
      } else if (fgOrder.created) {
        fgCreatedAt = new Date(fgOrder.created);
      }

      // 使用 upsert 避免重复
      await this.prisma.fgOrder.upsert({
        where: { fgOrderId: fgOrder.id },
        update: {
          link: fgOrder.link,
          serviceName: fgOrder.service_name,
          serviceType: fgOrder.service_type,
          quantity: fgOrder.quantity,
          startCount: fgOrder.start_count || 0,
          remains: fgOrder.remains,
          fgStatus: fgOrder.status,
          mode: fgOrder.mode,
          charge: fgOrder.charge?.value,
          lastSyncAt: new Date(),
        },
        create: {
          fgOrderId: fgOrder.id,
          externalId: fgOrder.external_id,
          link: fgOrder.link,
          serviceId: fgOrder.service_id,
          serviceName: fgOrder.service_name,
          serviceType: fgOrder.service_type,
          quantity: fgOrder.quantity,
          startCount: fgOrder.start_count || 0,
          remains: fgOrder.remains,
          fgStatus: fgOrder.status,
          mode: fgOrder.mode,
          charge: fgOrder.charge?.value,
          fgCreatedAt,
          lastSyncAt: new Date(),
        },
      });

      return { success: true, message: `订单 ${fgOrder.id} 同步成功` };
    } catch (error) {
      this.logger.error(`同步订单 ${fgOrder.id} 失败:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 批量同步 FG 订单
   */
  async syncOrders(params: FgOrderQueryParams = {}): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      message: '',
      synced: 0,
      failed: 0,
      errors: [],
    };

    // 从 FG 获取订单
    const response = await this.fgApi.getOrders(params);
    if (!response) {
      result.success = false;
      result.message = 'FG API 请求失败';
      return result;
    }

    const orders = response.data.list;
    this.logger.log(`📋 开始同步 ${orders.length} 个订单`);

    // 逐个同步订单
    for (const order of orders) {
      const syncResult = await this.syncOrderToLocal(order);
      if (syncResult.success) {
        result.synced++;
      } else {
        result.failed++;
        result.errors?.push(`订单 ${order.id}: ${syncResult.message}`);
      }
    }

    result.message = `同步完成: 成功 ${result.synced}, 失败 ${result.failed}`;
    this.logger.log(`✅ ${result.message}`);

    return result;
  }

  /**
   * 获取本地 FG 订单列表
   */
  async getLocalOrders(
    page: number = 1,
    pageSize: number = 20,
    status?: string
  ): Promise<{
    items: LocalFgOrderDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * pageSize;

    const whereCondition: any = {};
    if (status) {
      whereCondition.fgStatus = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.fgOrder.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          quest: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.fgOrder.count({ where: whereCondition }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id.toString(),
        fgOrderId: item.fgOrderId,
        externalId: item.externalId || undefined,
        link: item.link,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        serviceType: item.serviceType || undefined,
        quantity: item.quantity,
        startCount: item.startCount,
        remains: item.remains,
        fgStatus: item.fgStatus as any,
        mode: item.mode || undefined,
        charge: item.charge?.toString(),
        questId: item.questId?.toString(),
        syncError: item.syncError || undefined,
        lastSyncAt: item.lastSyncAt,
        fgCreatedAt: item.fgCreatedAt || undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        quest: item.quest
          ? {
              id: item.quest.id.toString(),
              title: item.quest.title,
              status: item.quest.status,
            }
          : undefined,
      })) as any,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取本地单个 FG 订单
   */
  async getLocalOrder(id: bigint) {
    const order = await this.prisma.fgOrder.findUnique({
      where: { id },
      include: {
        quest: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id.toString(),
      fgOrderId: order.fgOrderId,
      externalId: order.externalId,
      link: order.link,
      serviceId: order.serviceId,
      serviceName: order.serviceName,
      serviceType: order.serviceType,
      quantity: order.quantity,
      startCount: order.startCount,
      remains: order.remains,
      fgStatus: order.fgStatus,
      mode: order.mode,
      charge: order.charge?.toString(),
      questId: order.questId?.toString(),
      syncError: order.syncError,
      lastSyncAt: order.lastSyncAt,
      fgCreatedAt: order.fgCreatedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      quest: order.quest,
    };
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const [total, pending, inProgress, completed, withQuest] = await Promise.all([
      this.prisma.fgOrder.count(),
      this.prisma.fgOrder.count({ where: { fgStatus: 'pending' } }),
      this.prisma.fgOrder.count({ where: { fgStatus: 'in_progress' } }),
      this.prisma.fgOrder.count({ where: { fgStatus: 'completed' } }),
      this.prisma.fgOrder.count({ where: { questId: { not: null } } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      withQuest,
      apiAvailable: this.fgApi.isAvailable(),
    };
  }
}
