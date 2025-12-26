import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Headers,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { FgService } from './fg.service';
import { FgApiService } from './fg-api.service';
import { FgOrderQueryParams } from './dto/fg-order.dto';

@ApiTags('fg')
@Controller('api/v1/fg')
export class FgController {
  private readonly logger = new Logger(FgController.name);

  constructor(
    private readonly fgService: FgService,
    private readonly fgApi: FgApiService,
    private readonly jwtService: JwtService,
  ) {}

  // 验证管理员令牌
  private validateAdmin(authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的管理员令牌');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('未授权访问');
    }
  }

  /**
   * 检查 FG 服务状态
   */
  @Get('status')
  @ApiOperation({ summary: '检查 FG 服务状态' })
  async getStatus() {
    const stats = await this.fgService.getStats();
    return {
      success: true,
      data: {
        available: this.fgService.isAvailable(),
        ...stats,
      },
    };
  }

  /**
   * 从 FG API 获取订单列表 (直接查询 FG)
   */
  @Get('api/orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: '从 FG API 获取订单列表' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量' })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量' })
  async getOrdersFromApi(
    @Headers('authorization') authHeader: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    this.validateAdmin(authHeader);

    if (!this.fgService.isAvailable()) {
      return {
        success: false,
        message: 'FG API 未配置，请在 .env 中设置 FG_API_KEY',
      };
    }

    const params: FgOrderQueryParams = {};
    if (status) params.order_status = status as any;
    if (limit) params.limit = parseInt(limit, 10);
    if (offset) params.offset = parseInt(offset, 10);

    const result = await this.fgService.getOrdersFromFg(params);
    return {
      success: result.success,
      message: result.message,
      data: {
        orders: result.orders,
        pagination: result.pagination,
        total: result.total,
      },
    };
  }

  /**
   * 从 FG API 获取单个订单详情
   */
  @Get('api/orders/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '从 FG API 获取单个订单详情' })
  async getOrderFromApi(
    @Headers('authorization') authHeader: string,
    @Param('orderId') orderId: string,
  ) {
    this.validateAdmin(authHeader);

    if (!this.fgService.isAvailable()) {
      return {
        success: false,
        message: 'FG API 未配置，请在 .env 中设置 FG_API_KEY',
      };
    }

    const result = await this.fgService.getOrderFromFg(parseInt(orderId, 10));
    return {
      success: result.success,
      message: result.message,
      data: result.order,
    };
  }

  /**
   * 手动同步订单到本地
   */
  @Post('sync')
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动同步 FG 订单到本地' })
  @ApiQuery({ name: 'status', required: false, description: '筛选状态' })
  @ApiQuery({ name: 'limit', required: false, description: '同步数量' })
  async syncOrders(
    @Headers('authorization') authHeader: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    this.validateAdmin(authHeader);

    if (!this.fgService.isAvailable()) {
      return {
        success: false,
        message: 'FG API 未配置，请在 .env 中设置 FG_API_KEY',
      };
    }

    const params: FgOrderQueryParams = {};
    if (status) params.order_status = status as any;
    if (limit) params.limit = parseInt(limit, 10);

    this.logger.log(`📋 开始手动同步 FG 订单, 参数: ${JSON.stringify(params)}`);

    const result = await this.fgService.syncOrders(params);
    return {
      success: result.success,
      message: result.message,
      data: {
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
      },
    };
  }

  /**
   * 获取本地 FG 订单列表
   */
  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取本地 FG 订单列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  async getLocalOrders(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    this.validateAdmin(authHeader);

    const result = await this.fgService.getLocalOrders(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      status,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取本地单个 FG 订单详情
   */
  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取本地 FG 订单详情' })
  async getLocalOrder(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);

    const order = await this.fgService.getLocalOrder(BigInt(id));
    if (!order) {
      return {
        success: false,
        message: '订单不存在',
      };
    }

    return {
      success: true,
      data: order,
    };
  }

  /**
   * 获取 FG 统计信息
   */
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取 FG 同步统计' })
  async getStats(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);

    const stats = await this.fgService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Pull orders - 拉取待处理订单 (推荐方式)
   * 会自动将 pending 订单状态改为 processing
   */
  @Post('pull')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pull 待处理订单 (自动更新为 Processing)' })
  @ApiQuery({ name: 'service_ids', required: false, description: '服务 ID，逗号分隔' })
  @ApiQuery({ name: 'limit', required: false, description: '最大返回数量' })
  async pullOrders(
    @Headers('authorization') authHeader: string,
    @Query('service_ids') serviceIds?: string,
    @Query('limit') limit?: string,
  ) {
    this.validateAdmin(authHeader);

    if (!this.fgService.isAvailable()) {
      return {
        success: false,
        message: 'FG API 未配置，请在 .env 中设置 FG_API_KEY',
      };
    }

    this.logger.log(`📋 Pull FG 订单: service_ids=${serviceIds || 'all'}, limit=${limit || 100}`);

    const result = await this.fgApi.pullOrders({
      service_ids: serviceIds,
      limit: limit ? parseInt(limit, 10) : 100,
    });

    if (!result) {
      return {
        success: false,
        message: 'Pull 订单失败',
      };
    }

    return {
      success: true,
      message: `Pull 到 ${result.data?.count || 0} 个订单`,
      data: {
        count: result.data?.count || 0,
        orders: result.data?.list || [],
      },
    };
  }
}
