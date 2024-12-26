import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ILike } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './user.entity';
import { UserQuery } from './user.query';
import { PaginationResponse } from 'src/shared/pagination-response.dto';

@Injectable()
export class UserService {
  async save(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findByUsername(createUserDto.username);

    if (user) {
      throw new HttpException(
        `User with username ${createUserDto.username} is already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password } = createUserDto;
    createUserDto.password = await bcrypt.hash(password, 10);
    return User.create(createUserDto).save();
  }

  async findAll(userQuery: UserQuery): Promise<PaginationResponse<User>> {
    if (!userQuery.page) {
      userQuery.page = 1;
    }

    if (!userQuery.limit) {
      userQuery.limit = 10;
    }

    Object.keys(userQuery).forEach((key) => {
      if (key !== 'role' && key !== 'page' && key !== 'limit') {
        userQuery[key] = ILike(`%${userQuery[key]}%`);
      }
    });

    const where: any = {};
    for (const key in userQuery) {
      if (userQuery[key] !== undefined) {
        if (key !== 'page' && key !== 'limit') {
          where[key] = userQuery[key];
        }
      }
    }

    const [data, total] = await User.findAndCount({
      where,
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
      skip: (userQuery.page - 1) * userQuery.limit,
      take: userQuery.limit,
    });

    return {
      data,
      total,
      page: +userQuery.page,
      limit: +userQuery.limit,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await User.findOne(id);

    if (!user) {
      throw new HttpException(
        `Could not find user with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return User.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const currentUser = await this.findById(id);

    /* If username is same as before, delete it from the dto */
    if (currentUser.username === updateUserDto.username) {
      delete updateUserDto.username;
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.username) {
      if (await this.findByUsername(updateUserDto.username)) {
        throw new HttpException(
          `User with username ${updateUserDto.username} is already exists`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return User.create({ id, ...updateUserDto }).save();
  }

  async delete(id: string): Promise<string> {
    await User.delete(await this.findById(id));
    return id;
  }

  async count(): Promise<number> {
    return await User.count();
  }

  /* Hash the refresh token and save it to the database */
  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    const user = await this.findById(id);
    await User.update(user, {
      refreshToken: refreshToken ? await bcrypt.hash(refreshToken, 10) : null,
    });
  }
}
