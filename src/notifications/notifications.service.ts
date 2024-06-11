import { Model } from 'mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { CreateNotificationDTO } from 'src/notifications/notifications.dto';
import { SitesService } from 'src/sites/sites.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private readonly sitesService: SitesService,
  ) {}

  async crateNotification(notification: CreateNotificationDTO) {
    const createdNotification = new this.notificationModel(notification);
    return await createdNotification.save();
  }

  async getUsersNotifications(user: SessionUser) {
    const sites = await this.sitesService.getUsersSites(user);

    let allNotifications = [];

    for (const site of sites) {
      const notifications = await this.notificationModel.find({
        siteId: site._id,
      });

      allNotifications = allNotifications.concat(notifications);
    }

    return allNotifications;
  }
}
