import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { Image, PropertyType } from '@prisma/client';

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

  deleteHome(id: number) {
    this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async createHome({
    adress,
    city,
    landSize,
    numberOfBathrooms,
    numberOfBedrooms,
    price,
    type,
    images,
  }: CreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        adress,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        city,
        land_size: landSize,
        type,
        price,
        realtor_id: 5,
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
}
