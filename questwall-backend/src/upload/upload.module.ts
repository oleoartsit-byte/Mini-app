import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, '../../uploads'),
        filename: (req, file, cb) => {
          // 生成唯一文件名: 时间戳-随机数.扩展名
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 限制
      },
      fileFilter: (req, file, cb) => {
        // 只允许图片格式
        if (file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('只支持 jpg, jpeg, png, gif, webp 格式的图片'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
