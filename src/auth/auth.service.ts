import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserService } from '../users/user';
import { Services } from '../utils/constants';
import { compareHash } from '../utils/helpers';
import { ValidateUserDetails } from '../utils/types';
import { IAuthService } from './auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(@Inject(Services.USERS) private userService: IUserService) {}

  async validateUser(userDetails: ValidateUserDetails) {
    const user = await this.userService.findUser({ email: userDetails.email });
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    const isPasswordValid = await compareHash(
      userDetails.password,
      user.password,
    );

    return isPasswordValid ? user : null;
  }
}
