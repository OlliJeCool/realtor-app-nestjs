import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthController } from 'src/user/auth/auth.controller';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './user/auth/auth.service';
import { HomeModule } from './home/home.module';
import { HomeService } from './home/home.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './user/interceptors/user.interceptor';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UserModule, HomeModule],
  controllers: [AppController, AuthController],
  providers: [
    PrismaService,
    AuthService,
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
