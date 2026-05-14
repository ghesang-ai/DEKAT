import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private initialized = false;

  onModuleInit() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const hasValidCreds =
      privateKey &&
      !privateKey.includes('placeholder') &&
      process.env.FIREBASE_PROJECT_ID !== 'dekat-app';

    if (hasValidCreds && !admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          } as admin.ServiceAccount),
        });
        this.initialized = true;
      } catch (e: any) {
        console.warn(`Firebase init skipped: ${e.message}`);
      }
    }
  }

  async sendPush(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
    if (!fcmToken || !this.initialized) return;
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (error: any) {
      console.warn(`FCM send failed: ${error.message}`);
    }
  }
}
