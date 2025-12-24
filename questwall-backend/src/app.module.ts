import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestsModule } from './quests/quests.module';
import { WalletModule } from './wallet/wallet.module';
import { RewardsModule } from './rewards/rewards.module';
import { AdsModule } from './ads/ads.module';
import { RiskModule } from './risk/risk.module';
import { BillingModule } from './billing/billing.module';
import { TelegramModule } from './telegram/telegram.module';
import { TwitterModule } from './twitter/twitter.module';
import { AdminModule } from './admin/admin.module';
import { CheckInModule } from './checkin/checkin.module';
import { InviteModule } from './invite/invite.module';
import { PayoutModule } from './payout/payout.module';
import { GeoipModule } from './geoip/geoip.module';
import { UploadModule } from './upload/upload.module';
import { AiModule } from './ai/ai.module';
import { TutorialsModule } from './tutorials/tutorials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TelegramModule,
    TwitterModule,
    AuthModule,
    QuestsModule,
    WalletModule,
    RewardsModule,
    AdsModule,
    RiskModule,
    BillingModule,
    AdminModule,
    CheckInModule,
    InviteModule,
    PayoutModule,
    GeoipModule,
    UploadModule,
    AiModule,
    TutorialsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}