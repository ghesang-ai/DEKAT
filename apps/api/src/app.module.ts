import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GadgetsModule } from './gadgets/gadgets.module';
import { PostsModule } from './posts/posts.module';
import { MediaModule } from './media/media.module';
import { SocialModule } from './social/social.module';
import { CommunitiesModule } from './communities/communities.module';
import { InvitesModule } from './invites/invites.module';
import { AiModule } from './ai/ai.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsGateway } from './gateway/events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    GadgetsModule,
    PostsModule,
    MediaModule,
    SocialModule,
    CommunitiesModule,
    InvitesModule,
    AiModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
