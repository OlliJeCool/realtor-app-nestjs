import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from './dtos/home.dto';
import { PropertyType, UserRole } from '@prisma/client';
import { User, UserInterface } from 'src/user/decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') type?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(type && { type }),
      ...(price && { price }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  getHomeById(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<HomeResponseDto> {
    return this.homeService.getHome(id);
  }

  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInterface) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @Put(':id')
  async updateHome(
    @Body() body: UpdateHomeDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInterface,
  ): Promise<HomeResponseDto> {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.updateHomeById(body, id);
  }

  @Roles(UserRole.REALTOR, UserRole.ADMIN)
  @HttpCode(204)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserInterface,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    this.homeService.deleteHome(id);
  }

  @Roles(UserRole.USER)
  @Post('/:id/inquire')
  inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: UserInterface,
    @Body() { message }: InquireDto,
  ) {
    return this.homeService.inquireById(user, homeId, message);
  }

  @Roles(UserRole.REALTOR)
  @Get('/:id/messages')
  async getHomeMessages(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: UserInterface,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(homeId);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.getMessagesByHome(homeId);
  }
}
