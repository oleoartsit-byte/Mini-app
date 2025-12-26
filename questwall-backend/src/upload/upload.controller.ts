import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BunnyStorageService } from './bunny-storage.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly bunnyStorage: BunnyStorageService) {}

  @Post('image')
  @ApiOperation({ summary: '上传图片到 CDN' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }

    try {
      // 上传到 Bunny CDN Storage
      const result = await this.bunnyStorage.uploadFile(file);

      return {
        success: true,
        url: result.url,
        filename: result.filename,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      throw new BadRequestException(`图片上传失败: ${error.message}`);
    }
  }
}
