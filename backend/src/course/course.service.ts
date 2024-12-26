import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';
import { PaginationResponse } from 'src/shared/pagination-response.dto';

@Injectable()
export class CourseService {
  async save(createCourseDto: CreateCourseDto): Promise<Course> {
    return await Course.create({
      ...createCourseDto,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(courseQuery: CourseQuery): Promise<PaginationResponse<Course>> {
    if (!courseQuery.page) {
      courseQuery.page = 1;
    }

    if (!courseQuery.limit) {
      courseQuery.limit = 10;
    }

    if (!courseQuery.orderBy) {
      courseQuery.orderBy = 'dateCreated';
    }

    if (!courseQuery.orderDirection) {
      courseQuery.orderDirection = 'DESC';
    }

    Object.keys(courseQuery).forEach((key) => {
      if (
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'orderBy' &&
        key !== 'orderDirection'
      ) {
        courseQuery[key] = ILike(`%${courseQuery[key]}%`);
      }
    });

    const where: any = {};
    for (const key in courseQuery) {
      if (courseQuery[key] !== undefined) {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'orderBy' &&
          key !== 'orderDirection'
        ) {
          where[key] = courseQuery[key];
        }
      }
    }

    const order = {};
    if (courseQuery.orderBy) {
      order[courseQuery.orderBy] =
        courseQuery.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
    
    const [data, total] = await Course.findAndCount({
      where,
      order,
      skip: (courseQuery.page - 1) * courseQuery.limit,
      take: courseQuery.limit,
    });

    return {
      data,
      total,
      page: +courseQuery.page,
      limit: +courseQuery.limit,
    };
  }

  async findById(id: string): Promise<Course> {
    const course = await Course.findOne(id);
    if (!course) {
      throw new HttpException(
        `Could not find course with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findById(id);
    return await Course.create({ id: course.id, ...updateCourseDto }).save();
  }

  async delete(id: string): Promise<string> {
    const course = await this.findById(id);
    await Course.delete(course);
    return id;
  }

  async count(): Promise<number> {
    return await Course.count();
  }
}
