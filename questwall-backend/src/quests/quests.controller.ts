import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuestsService } from './quests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { Request } from 'express';
import { GeoipService } from '../geoip/geoip.service';

@ApiTags('quests')
@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(
    private readonly questsService: QuestsService,
    private readonly geoipService: GeoipService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取任务列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String, description: '语言: zh | en' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('lang') lang?: string,
    @CurrentUser() user?: CurrentUserData,
    @Req() req?: Request,
  ) {
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 20;
    const userId = user ? BigInt(user.id) : undefined;
    const language = lang || 'zh';

    // 获取用户 IP 和国家代码
    const forwardedFor = req?.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || req?.ip;
    const countryCode = ip ? this.geoipService.getCountryCode(ip) : null;

    console.log(`📍 用户请求: IP=${ip}, 国家=${countryCode || '未知'}`);

    return this.questsService.findAll(pageNum, pageSizeNum, userId, language, countryCode);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的任务列表' })
  async getMyQuests(@CurrentUser() user: CurrentUserData) {
    return this.questsService.getUserQuests(BigInt(user.id));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取任务详情' })
  @ApiQuery({ name: 'lang', required: false, type: String, description: '语言: zh | en' })
  async findOne(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.questsService.findOne(BigInt(id), lang || 'zh');
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建任务（广告主）' })
  async create(
    @Body() createQuestDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.questsService.create(BigInt(user.id), createQuestDto);
  }

  @Post(':id/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取任务' })
  async claim(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] as string;
    const visitorId = req.headers['x-visitor-id'] as string;
    return this.questsService.claim(BigInt(user.id), BigInt(id), ip, visitorId);
  }

  @Post(':id/submit')
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交任务证明' })
  async submit(
    @Param('id') id: string,
    @Body() submitDto: any,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.questsService.submit(BigInt(user.id), BigInt(id), submitDto);
  }

  @Post(':id/reward')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发放奖励（管理接口）' })
  async reward(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.questsService.reward(BigInt(user.id), BigInt(id));
  }
}
