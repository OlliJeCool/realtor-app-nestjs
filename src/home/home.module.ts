import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    HomeService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [HomeController],
  exports: [HomeService],
})
export class HomeModule {}
