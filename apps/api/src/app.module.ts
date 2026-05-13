import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    PrismaModule,
  ],
})
export class AppModule {}
