import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getProfile(userId: number) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.repo.getProfile(userId);
  }
}
