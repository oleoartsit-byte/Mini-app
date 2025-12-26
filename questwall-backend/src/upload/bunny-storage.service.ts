import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BunnyStorageService {
  private readonly logger = new Logger(BunnyStorageService.name);

  private readonly storageZone = process.env.BUNNY_STORAGE_ZONE || 'fansgurusstorage';
  private readonly apiKey = process.env.BUNNY_STORAGE_API_KEY || '';
  private readonly cdnUrl = process.env.BUNNY_CDN_URL || 'https://fansgurus.b-cdn.net';
  private readonly storagePath = process.env.BUNNY_STORAGE_PATH || 'mini app';

  // Bunny Storage API 基础 URL
  private readonly storageApiUrl = `https://storage.bunnycdn.com/${this.storageZone}`;

  /**
   * 上传文件到 Bunny Storage
   * @param file Multer 文件对象
   * @returns 上传后的 CDN URL
   */
  async uploadFile(file: Express.Multer.File): Promise<{
    url: string;
    filename: string;
  }> {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${uniqueSuffix}.${ext}`;

    // 完整的存储路径
    const fullPath = `${this.storagePath}/${filename}`;
    const uploadUrl = `${this.storageApiUrl}/${encodeURIComponent(this.storagePath)}/${filename}`;

    this.logger.log(`Uploading file to Bunny Storage: ${fullPath}`);

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': this.apiKey,
          'Content-Type': file.mimetype,
        },
        body: new Uint8Array(file.buffer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Bunny Storage upload failed: ${response.status} - ${errorText}`);
        throw new Error(`上传失败: ${response.status}`);
      }

      // 返回 CDN URL
      const cdnFileUrl = `${this.cdnUrl}/${encodeURIComponent(this.storagePath)}/${filename}`;

      this.logger.log(`File uploaded successfully: ${cdnFileUrl}`);

      return {
        url: cdnFileUrl,
        filename: filename,
      };
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 删除 Bunny Storage 中的文件
   * @param filename 文件名
   */
  async deleteFile(filename: string): Promise<void> {
    const deleteUrl = `${this.storageApiUrl}/${encodeURIComponent(this.storagePath)}/${filename}`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.apiKey,
        },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to delete file: ${filename}`);
      } else {
        this.logger.log(`File deleted: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Delete error: ${error.message}`);
    }
  }
}
