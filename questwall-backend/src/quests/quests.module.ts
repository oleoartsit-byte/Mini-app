import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { RiskModule } from '../risk/risk.module';
import { AuthModule } from '../auth/auth.module';
import { TwitterModule } from '../twitter/twitter.module';

@Module({
  imports: [RiskModule, AuthModule, TwitterModule],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}