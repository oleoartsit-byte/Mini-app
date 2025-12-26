// FG API 响应类型定义

// FG 订单列表响应
export interface FgOrderListResponse {
  data: {
    count: number;
    list: FgOrderData[];
    pagination: {
      prev_page_href: string;
      next_page_href: string;
      offset: number;
      limit: number;
    };
  };
  error_message: string;
  error_code: number;
}

// FG 单个订单响应
export interface FgOrderResponse {
  data: FgOrderData;
  error_message: string;
  error_code: number;
}

// FG 订单数据
export interface FgOrderData {
  id: number;
  external_id?: string;
  user?: string;
  creation_type?: string;
  charge?: {
    value: number;
    currency_code: string;
    formatted: string;
  };
  provider_charge?: {
    value: number;
    currency_code: string;
    formatted: string;
  };
  link: string;
  order_buttons?: Record<string, any>;
  start_count?: number;
  quantity: number;
  service_id: number;
  service_type?: string;
  service_name: string;
  status: FgOrderStatus;
  remains: number;
  is_autocomplete?: boolean;
  is_active_autocomplete?: boolean;
  created?: string;
  created_timestamp?: number;
  mode?: 'auto' | 'manual';
  provider?: string;
  provider_response?: any;
  last_update?: string;
  last_update_timestamp?: number;
  ip_address?: string;
  actions?: Record<string, any>;
  error_message?: string;
  error_code?: number;
  user_data?: any[];
}

// FG 订单状态
export type FgOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'canceled'
  | 'error'
  | 'fail';

// FG 状态更新响应
export interface FgChangeStatusResponse {
  data: {
    ids: number[];
    status: string;
    skipped_ids: number[];
  };
  error_message: string;
  error_code: number;
}

// 订单查询参数
export interface FgOrderQueryParams {
  ids?: string;
  external_order_ids?: string;
  created_from?: number;
  created_to?: number;
  order_status?: FgOrderStatus;
  mode?: 'manual' | 'auto';
  service_ids?: string;
  creation_type?: string;
  user?: string;
  provider?: string;
  ip_address?: string;
  link?: string;
  offset?: number;
  limit?: number;
  sort?: 'date-desc' | 'date-asc';
}

// 本地 FG 订单 DTO
export interface LocalFgOrderDto {
  id: string;
  fgOrderId: number;
  externalId?: string;
  link: string;
  serviceId: number;
  serviceName: string;
  serviceType?: string;
  quantity: number;
  startCount: number;
  remains: number;
  fgStatus: FgOrderStatus;
  mode?: string;
  charge?: string;
  questId?: string;
  syncError?: string;
  lastSyncAt: Date;
  fgCreatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 同步结果
export interface SyncResult {
  success: boolean;
  message: string;
  synced: number;
  failed: number;
  errors?: string[];
}
