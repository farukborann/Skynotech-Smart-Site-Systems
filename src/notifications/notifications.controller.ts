import { NotificationsService } from 'src/notifications/notifications.service';

import { Controller, Get, Req } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUsersNotifications(@Req() req) {
    return await this.notificationsService.getUsersNotifications(req.user);
  }
}
