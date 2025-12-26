import { Module, Global } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController, BotWebhookController } from './telegram.controller';

@Global()
@Module({
  controllers: [TelegramController, BotWebhookController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
