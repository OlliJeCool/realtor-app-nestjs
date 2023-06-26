import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthController } from 'src/user/auth/auth.controller';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './user/auth/auth.service';
import { HomeModule } from './home/home.module';
import { HomeService } from './home/home.service';

@Module({
  imports: [UserModule, HomeModule],
  controllers: [AppController, AuthController],
  providers: [PrismaService, AuthService, HomeService],
})
export class AppModule {}
