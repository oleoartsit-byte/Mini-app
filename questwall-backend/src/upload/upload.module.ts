import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadController } from './upload.controller';
import { BunnyStorageService } from './bunny-storage.service';

@Module({
  imports: [
    MulterModule.register({
      // 使用内存存储，文件会被保存到 buffer 中，然后上传到 Bunny Storage
      storage: memoryStorage(),
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
  providers: [BunnyStorageService],
  exports: [BunnyStorageService],
})
export class UploadModule {}
