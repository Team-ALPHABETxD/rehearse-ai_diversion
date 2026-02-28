import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: "secc",
      signOptions: { expiresIn: '24h' },
    }),
    UserModule // imports the user services exported from the user module
  ], 
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
