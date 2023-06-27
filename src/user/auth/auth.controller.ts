import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ProductKeyCreationDto, SignInDto, SignUpDto } from '../dtos/auth.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User, UserInterface } from '../decorators/user.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/signup/:type')
  async signUp(
    @Body() body: SignUpDto,
    @Param('type', new ParseEnumPipe(UserRole)) userRole: UserRole,
  ) {
    if (userRole !== UserRole.USER) {
      if (!body.productKey) throw new UnauthorizedException();
      const validProductKey = `${body.email}-${userRole}-${process.env.PRODUCT_KEY_SECRET}`;
      const isValidKey = await bcrypt.compare(validProductKey, body.productKey);
      if (!isValidKey) throw new UnauthorizedException();
    }
    return this.authService.signUp(body, userRole);
  }

  @Post('/signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Roles(UserRole.ADMIN)
  @Post('/key')
  generateProductKey(@Body() body: ProductKeyCreationDto) {
    return this.authService.genereateProductKey(body.email, body.userRole);
  }

  @Get('/me')
  me(@User() user: UserInterface) {
    return user;
  }
}
