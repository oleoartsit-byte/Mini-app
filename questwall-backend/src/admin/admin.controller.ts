import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { QuestStatus, PayoutStatus, BlacklistType, ActionStatus, TutorialStatus } from '@prisma/client';

// 简单的管理员认证守卫
class AdminAuthGuard {
  constructor(private jwtService: JwtService) {}

  validate(token: string) {
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
}

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  private authGuard: AdminAuthGuard;

  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {
    this.authGuard = new AdminAuthGuard(jwtService);
  }

  // 验证管理员令牌
  private validateAdmin(authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }
    const token = authHeader.replace('Bearer ', '');
    return this.authGuard.validate(token);
  }

  // ==================== 认证接口 ====================

  @Post('auth/login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() body: { username: string; password: string }) {
    return this.adminService.login(body.username, body.password);
  }

  @Post('auth/init')
  @ApiOperation({ summary: '初始化管理员账号（仅首次使用）' })
  async initAdmin(@Body() body: { username: string; password: string }) {
    return this.adminService.createAdmin(body.username, body.password, 'super_admin');
  }

  @Get('auth/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员信息' })
  async getCurrentAdmin(@Headers('authorization') authHeader: string) {
    const admin = this.validateAdmin(authHeader);
    return {
      id: admin.sub,
      username: admin.username,
      role: admin.role,
    };
  }

  // ==================== 统计数据接口 ====================

  @Get('stats/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  async getDashboardStats(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);
    return this.adminService.getDashboardStats();
  }

  @Get('stats/trends')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取趋势数据（图表）' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: '天数，默认7天' })
  async getTrendData(
    @Headers('authorization') authHeader: string,
    @Query('days') days?: string,
  ) {
    this.validateAdmin(authHeader);
    const daysNum = parseInt(days) || 7;
    return this.adminService.getTrendData(daysNum);
  }

  // ==================== 任务管理接口 ====================

  @Get('quests')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取任务列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getQuests(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const questStatus = status ? (status as QuestStatus) : undefined;
    return this.adminService.getQuests(pageNum, pageSizeNum, questStatus);
  }

  @Get('quests/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取任务详情（管理员）' })
  async getQuestDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getQuestDetail(BigInt(id));
  }

  @Post('quests')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建任务（管理员）' })
  async createQuest(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.createQuest(body);
  }

  @Put('quests/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新任务（管理员）' })
  async updateQuest(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.updateQuest(BigInt(id), body);
  }

  @Patch('quests/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新任务状态（管理员）' })
  async updateQuestStatus(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { status: QuestStatus },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.updateQuestStatus(BigInt(id), body.status);
  }

  @Delete('quests/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除任务（管理员）' })
  async deleteQuest(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.deleteQuest(BigInt(id));
  }

  // ==================== 用户管理接口 ====================

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUsers(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    return this.adminService.getUsers(pageNum, pageSizeNum, search);
  }

  @Get('users/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户详情（管理员）' })
  async getUserDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getUserDetail(BigInt(id));
  }

  @Get('users/:id/completed-quests')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户已完成的任务列表（管理员）' })
  async getUserCompletedQuests(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getUserCompletedQuests(BigInt(id));
  }

  // ==================== 奖励管理接口 ====================

  @Get('rewards')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取奖励记录（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getRewards(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    return this.adminService.getRewards(pageNum, pageSizeNum);
  }

  // ==================== 提现管理接口 ====================

  @Get('payouts')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取提现列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getPayouts(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const payoutStatus = status ? (status as PayoutStatus) : undefined;
    return this.adminService.getPayouts(pageNum, pageSizeNum, payoutStatus);
  }

  @Get('payouts/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取提现统计（管理员）' })
  async getPayoutStats(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);
    return this.adminService.getPayoutStats();
  }

  @Get('payouts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取提现详情（管理员）' })
  async getPayoutDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getPayoutDetail(BigInt(id));
  }

  @Post('payouts/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过提现（管理员）' })
  async approvePayout(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { txHash?: string },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.approvePayout(BigInt(id), body.txHash);
  }

  @Post('payouts/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '拒绝提现（管理员）' })
  async rejectPayout(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.rejectPayout(BigInt(id), body.reason);
  }

  @Post('payouts/:id/complete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '完成提现（填写交易哈希或上传截图）' })
  async completePayout(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { txHash?: string; proofImage?: string },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.completePayout(BigInt(id), body.txHash, body.proofImage);
  }

  // ==================== 风控管理接口 ====================

  @Get('risk/events')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取风控事件列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'severity', required: false, type: String })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  async getRiskEvents(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('severity') severity?: string,
    @Query('eventType') eventType?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 20;
    return this.adminService.getRiskEvents(pageNum, pageSizeNum, severity, eventType);
  }

  @Get('risk/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取风控统计' })
  async getRiskStats(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);
    return this.adminService.getRiskStats();
  }

  @Get('risk/user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户风控历史' })
  async getUserRiskHistory(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getUserRiskHistory(BigInt(id));
  }

  // ==================== 黑名单管理接口 ====================

  @Get('blacklist')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取黑名单列表' })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getBlacklist(
    @Headers('authorization') authHeader: string,
    @Query('type') type?: string,
  ) {
    this.validateAdmin(authHeader);
    const blacklistType = type ? (type as BlacklistType) : undefined;
    return this.adminService.getBlacklist(blacklistType);
  }

  @Post('blacklist')
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加到黑名单' })
  async addToBlacklist(
    @Headers('authorization') authHeader: string,
    @Body() body: { type: BlacklistType; value: string; reason?: string; expiresAt?: string },
  ) {
    this.validateAdmin(authHeader);
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    return this.adminService.addToBlacklist(body.type, body.value, body.reason, expiresAt);
  }

  @Delete('blacklist/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '从黑名单移除' })
  async removeFromBlacklist(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.removeFromBlacklist(BigInt(id));
  }

  // ==================== 截图审核接口 ====================

  @Get('reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待审核截图列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'SUBMITTED | VERIFIED | REJECTED' })
  async getPendingReviews(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const actionStatus = status ? (status as ActionStatus) : undefined;
    return this.adminService.getPendingReviews(pageNum, pageSizeNum, actionStatus);
  }

  @Get('reviews/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取审核统计' })
  async getReviewStats(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);
    return this.adminService.getReviewStats();
  }

  @Get('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取审核详情' })
  async getReviewDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getReviewDetail(BigInt(id));
  }

  @Post('reviews/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过（发放奖励）' })
  async approveReview(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.approveReview(BigInt(id));
  }

  @Post('reviews/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核拒绝' })
  async rejectReview(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.rejectReview(BigInt(id), body.reason);
  }

  // ==================== 教程管理接口 ====================

  @Get('tutorials')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取教程列表（管理员）' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getTutorials(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    this.validateAdmin(authHeader);
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const tutorialStatus = status ? (status as TutorialStatus) : undefined;
    return this.adminService.getTutorials(pageNum, pageSizeNum, tutorialStatus);
  }

  @Get('tutorials/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取教程详情（管理员）' })
  async getTutorialDetail(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.getTutorialDetail(BigInt(id));
  }

  @Post('tutorials')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建教程（管理员）' })
  async createTutorial(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.createTutorial(body);
  }

  @Put('tutorials/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新教程（管理员）' })
  async updateTutorial(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.updateTutorial(BigInt(id), body);
  }

  @Patch('tutorials/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新教程状态（管理员）' })
  async updateTutorialStatus(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { status: TutorialStatus },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.updateTutorialStatus(BigInt(id), body.status);
  }

  @Delete('tutorials/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除教程（管理员）' })
  async deleteTutorial(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.deleteTutorial(BigInt(id));
  }

  // ==================== 系统配置接口 ====================

  @Get('configs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有配置' })
  async getAllConfigs(@Headers('authorization') authHeader: string) {
    this.validateAdmin(authHeader);
    return this.adminService.getAllConfigs();
  }

  @Post('configs/checkin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '保存签到配置' })
  async saveCheckInConfig(
    @Headers('authorization') authHeader: string,
    @Body() body: {
      day1?: number;
      day2?: number;
      day3?: number;
      day4?: number;
      day5?: number;
      day6?: number;
      day7?: number;
      makeupCost?: number;
    },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.saveCheckInConfig(body);
  }

  @Post('configs/invite')
  @ApiBearerAuth()
  @ApiOperation({ summary: '保存邀请配置' })
  async saveInviteConfig(
    @Headers('authorization') authHeader: string,
    @Body() body: {
      inviterReward?: number;
      inviteeReward?: number;
      maxInvites?: number;
    },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.saveInviteConfig(body);
  }

  @Post('configs/system')
  @ApiBearerAuth()
  @ApiOperation({ summary: '保存系统配置' })
  async saveSystemConfig(
    @Headers('authorization') authHeader: string,
    @Body() body: {
      siteName?: string;
      maintenanceMode?: boolean;
      telegramBotToken?: string;
    },
  ) {
    this.validateAdmin(authHeader);
    return this.adminService.saveSystemConfig(body);
  }
}
