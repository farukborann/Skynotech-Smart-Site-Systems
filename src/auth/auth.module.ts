import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local/local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [UsersModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
