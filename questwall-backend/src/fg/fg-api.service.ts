import { Injectable, Logger } from '@nestjs/common';
import {
  FgOrderListResponse,
  FgOrderResponse,
  FgChangeStatusResponse,
  FgOrderQueryParams,
  FgOrderStatus,
} from './dto/fg-order.dto';

@Injectable()
export class FgApiService {
  private readonly logger = new Logger(FgApiService.name);
  private readonly apiKey = process.env.FG_API_KEY;
  private readonly baseUrl = 'https://famousgurus.com/adminapi/v2';

  /**
   * 检查 API 是否可用
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * 获取订单列表
   */
  async getOrders(params: FgOrderQueryParams = {}): Promise<FgOrderListResponse | null> {
    try {
      if (!this.apiKey) {
        this.logger.error('FG_API_KEY 未配置');
        return null;
      }

      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (params.ids) queryParams.set('ids', params.ids);
      if (params.external_order_ids) queryParams.set('external_order_ids', params.external_order_ids);
      if (params.created_from) queryParams.set('created_from', params.created_from.toString());
      if (params.created_to) queryParams.set('created_to', params.created_to.toString());
      if (params.order_status) queryParams.set('order_status', params.order_status);
      if (params.mode) queryParams.set('mode', params.mode);
      if (params.service_ids) queryParams.set('service_ids', params.service_ids);
      if (params.creation_type) queryParams.set('creation_type', params.creation_type);
      if (params.user) queryParams.set('user', params.user);
      if (params.provider) queryParams.set('provider', params.provider);
      if (params.ip_address) queryParams.set('ip_address', params.ip_address);
      if (params.link) queryParams.set('link', params.link);
      if (params.offset !== undefined) queryParams.set('offset', params.offset.toString());
      if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
      if (params.sort) queryParams.set('sort', params.sort);

      const url = `${this.baseUrl}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      this.logger.log(`📋 获取 FG 订单列表: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        this.logger.error(`FG API 请求失败: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.error_code !== 0) {
        this.logger.error(`FG API 错误: ${data.error_message}`);
        return null;
      }

      this.logger.log(`✅ 获取到 ${data.data?.count || 0} 个订单`);
      return data;
    } catch (error) {
      this.logger.error('获取 FG 订单列表失败:', error);
      return null;
    }
  }

  /**
   * 获取单个订单详情
   */
  async getOrder(orderId: number): Promise<FgOrderResponse | null> {
    try {
      if (!this.apiKey) {
        this.logger.error('FG_API_KEY 未配置');
        return null;
      }

      const url = `${this.baseUrl}/orders/${orderId}`;
      this.logger.log(`📋 获取 FG 订单详情: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        this.logger.error(`FG API 请求失败: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.error_code !== 0) {
        this.logger.error(`FG API 错误: ${data.error_message}`);
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`获取 FG 订单 ${orderId} 详情失败:`, error);
      return null;
    }
  }

  /**
   * 更新订单状态
   */
  async changeStatus(
    ids: number[],
    status: FgOrderStatus
  ): Promise<FgChangeStatusResponse | null> {
    try {
      if (!this.apiKey) {
        this.logger.error('FG_API_KEY 未配置');
        return null;
      }

      const url = `${this.baseUrl}/orders/change-status`;
      this.logger.log(`📋 更新 FG 订单状态: ${ids.join(',')} -> ${status}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          ids: ids.join(','),
          status,
        }),
      });

      if (!response.ok) {
        this.logger.error(`FG API 请求失败: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.error_code !== 0) {
        this.logger.error(`FG API 错误: ${data.error_message}`);
        return null;
      }

      this.logger.log(`✅ 成功更新 ${data.data?.ids?.length || 0} 个订单状态`);
      if (data.data?.skipped_ids?.length > 0) {
        this.logger.warn(`⚠️ 跳过 ${data.data.skipped_ids.length} 个订单: ${data.data.skipped_ids.join(',')}`);
      }

      return data;
    } catch (error) {
      this.logger.error('更新 FG 订单状态失败:', error);
      return null;
    }
  }

  /**
   * 获取待处理订单 (pending 状态)
   */
  async getPendingOrders(limit: number = 100): Promise<FgOrderListResponse | null> {
    return this.getOrders({
      order_status: 'pending',
      limit,
      sort: 'date-desc',
    });
  }

  /**
   * 获取进行中的订单 (in_progress 状态)
   */
  async getInProgressOrders(limit: number = 100): Promise<FgOrderListResponse | null> {
    return this.getOrders({
      order_status: 'in_progress',
      limit,
      sort: 'date-desc',
    });
  }

  /**
   * Pull orders - 拉取待处理订单并自动更新为 Processing
   * 这是推荐的方式，会自动将 pending 订单状态改为 processing
   * 注意：只处理 manual 模式且最近 90 天的订单
   */
  async pullOrders(params: {
    service_ids?: string;  // 服务 ID，逗号分隔
    limit?: number;        // 最大返回数量
  } = {}): Promise<FgOrderListResponse | null> {
    try {
      if (!this.apiKey) {
        this.logger.error('FG_API_KEY 未配置');
        return null;
      }

      const url = `${this.baseUrl}/orders/pull`;
      this.logger.log(`📋 Pull FG 订单: service_ids=${params.service_ids || 'all'}, limit=${params.limit || 100}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          service_ids: params.service_ids,
          limit: params.limit || 100,
        }),
      });

      if (!response.ok) {
        this.logger.error(`FG API 请求失败: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();

      if (data.error_code && data.error_code !== 0) {
        this.logger.error(`FG API 错误: ${data.error_message}`);
        return null;
      }

      this.logger.log(`✅ Pull 到 ${data.data?.count || 0} 个订单`);
      return data;
    } catch (error) {
      this.logger.error('Pull FG 订单失败:', error);
      return null;
    }
  }
}
