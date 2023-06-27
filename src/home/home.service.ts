import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType, UserRole } from '@prisma/client';

interface GetHomesFilter {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  adress: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  type: PropertyType;
  images: { source: string }[];
}

interface UpdateHomeParams {
  adress?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: GetHomesFilter): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        adress: true,
        city: true,
        price: true,
        type: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            source: true,
          },
          take: 1,
        },
      },
      where: filter,
    });

    if (homes.length < 0)
      throw new NotFoundException('No listings that match these parameters!');
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].source };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
  }

  async getHome(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findFirst({
      where: {
        id,
      },
    });
    return new HomeResponseDto(home);
  }

  async deleteHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) throw new NotFoundException();
    const deleteImages = this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });
    const deleteHome = this.prismaService.home.delete({
      where: {
        id,
      },
    });

    await this.prismaService.$transaction([deleteImages, deleteHome]);
  }

  async createHome(
    {
      adress,
      city,
      landSize,
      numberOfBathrooms,
      numberOfBedrooms,
      price,
      type,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!(user.role === UserRole.REALTOR)) throw new UnauthorizedException();
    const home = await this.prismaService.home.create({
      data: {
        adress,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        type,
        price,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { source: image.source, home_id: home.id };
    });
    await this.prismaService.image.createMany({
      data: homeImages,
    });
    return new HomeResponseDto(home);
  }

  async updateHomeById(
    data: UpdateHomeParams,
    id: number,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) throw new NotFoundException();
    const newHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });
    return new HomeResponseDto(newHome);
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            id: true,
            email: true,
          },
        },
      },
    });

    if (!home) throw new NotFoundException();

    return home.realtor;
  }
}
