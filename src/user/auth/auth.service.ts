import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

export interface SignUpParams {
  email: string;
  password: string;
  phone?: string;
  name: string;
}

interface SignInParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(
    { email, password, phone, name }: SignUpParams,
    userRole: UserRole,
  ) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) throw new ConflictException();

    const hashedPass = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPass,
        name,
        phone_number: phone,
        role: userRole,
      },
    });
    return await this.generateJWT(user.name, user.id);
  }

  async signIn({ email, password }: SignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new HttpException('Imvalid credentials', 400);
    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) throw new HttpException('Invalid credentials', 400);
    return await this.generateJWT(user.name, user.id);
  }

  private async generateJWT(name: string, id: number) {
    const token = await jwt.sign(
      {
        id,
        name,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: 3600,
      },
    );
    return token;
  }

  async genereateProductKey(email: string, userRole: UserRole) {
    const string = `${email}-${userRole}-${process.env.PRODUCT_KEY_SECRET}`;
    return {
      token: await bcrypt.hash(string, 10),
    };
  }
}
