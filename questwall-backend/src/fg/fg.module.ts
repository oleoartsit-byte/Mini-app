import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { FgController } from './fg.controller';
import { FgService } from './fg.service';
import { FgApiService } from './fg-api.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FgController],
  providers: [FgService, FgApiService],
  exports: [FgService, FgApiService],
})
export class FgModule {}
