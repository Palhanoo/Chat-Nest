import { Inject, Injectable } from '@nestjs/common';
import { IUserService } from '../users/user';
import { Services } from '../utils/constants';
import { IAuthService } from './auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(@Inject(Services.USERS) private userService: IUserService) {}

  validateUser() {}
}
