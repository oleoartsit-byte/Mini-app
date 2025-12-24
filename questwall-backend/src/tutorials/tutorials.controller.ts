import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TutorialsService } from './tutorials.service';
import { Public } from '../auth/public.decorator';

@ApiTags('tutorials')
@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取教程列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'lang', required: false, type: String, description: '语言: zh | en' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('lang') lang?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 20;
    const language = lang || 'zh';

    return this.tutorialsService.findAll(pageNum, pageSizeNum, category, language);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: '获取教程分类列表' })
  @ApiQuery({ name: 'lang', required: false, type: String, description: '语言: zh | en' })
  async getCategories(@Query('lang') lang?: string) {
    return this.tutorialsService.getCategories(lang || 'zh');
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取教程详情' })
  @ApiQuery({ name: 'lang', required: false, type: String, description: '语言: zh | en' })
  async findOne(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    const tutorial = await this.tutorialsService.findOne(BigInt(id), lang || 'zh');
    if (!tutorial) {
      throw new NotFoundException('教程不存在');
    }
    return tutorial;
  }
}
