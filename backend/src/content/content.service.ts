import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CourseService } from '../course/course.service';
import { CreateContentDto, UpdateContentDto } from './content.dto';
import { Content } from './content.entity';
import { ContentQuery } from './content.query';
import { PaginationResponse } from 'src/shared/pagination-response.dto';

@Injectable()
export class ContentService {
  constructor(private readonly courseService: CourseService) {}

  async save(
    courseId: string,
    createContentDto: CreateContentDto,
  ): Promise<Content> {
    const { name, description } = createContentDto;
    const course = await this.courseService.findById(courseId);
    return await Content.create({
      name,
      description,
      course,
      dateCreated: new Date(),
    }).save();
  }

  async findAll(
    contentQuery: ContentQuery,
  ): Promise<PaginationResponse<Content>> {
    if (!contentQuery.page) {
      contentQuery.page = 1;
    }

    if (!contentQuery.limit) {
      contentQuery.limit = 10;
    }

    if (!contentQuery.orderBy) {
      contentQuery.orderBy = 'dateCreated';
    }

    if (!contentQuery.orderDirection) {
      contentQuery.orderDirection = 'DESC';
    }

    Object.keys(contentQuery).forEach((key) => {
      if (
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'orderBy' &&
        key !== 'orderDirection'
      ) {
        contentQuery[key] = ILike(`%${contentQuery[key]}%`);
      }
    });

    const where: any = {};
    for (const key in contentQuery) {
      if (contentQuery[key] !== undefined) {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'orderBy' &&
          key !== 'orderDirection'
        ) {
          where[key] = contentQuery[key];
        }
      }
    }

    const order = {};
    if (contentQuery.orderBy) {
      order[contentQuery.orderBy] =
        contentQuery.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }

    const [data, total] = await Content.findAndCount({
      where,
      order,
      skip: (contentQuery.page - 1) * contentQuery.limit,
      take: contentQuery.limit,
    });

    return {
      data,
      total,
      page: +contentQuery.page,
      limit: +contentQuery.limit,
    };
  }

  async findById(id: string): Promise<Content> {
    const content = await Content.findOne(id);

    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return content;
  }

  async findByCourseIdAndId(courseId: string, id: string): Promise<Content> {
    const content = await Content.findOne({ where: { courseId, id } });
    if (!content) {
      throw new HttpException(
        `Could not find content with matching id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return content;
  }


  async findAllByCourseId(
    courseId: string,
    contentQuery: ContentQuery,
  ): Promise<PaginationResponse<Content>> {
    if (!contentQuery.page) {
      contentQuery.page = 1;
    }
  
    if (!contentQuery.limit) {
      contentQuery.limit = 10;
    }
  
    if (!contentQuery.orderBy) {
      contentQuery.orderBy = 'dateCreated';
    }
  
    if (!contentQuery.orderDirection) {
      contentQuery.orderDirection = 'DESC';
    }
  
    Object.keys(contentQuery).forEach((key) => {
      if (
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'orderBy' &&
        key !== 'orderDirection'
      ) {
        contentQuery[key] = ILike(`%${contentQuery[key]}%`);
      }
    });
  
    const where: any = { courseId };
    for (const key in contentQuery) {
      if (contentQuery[key] !== undefined) {
        if (
          key !== 'page' &&
          key !== 'limit' &&
          key !== 'orderBy' &&
          key !== 'orderDirection'
        ) {
          where[key] = contentQuery[key];
        }
      }
    }
  
    const order = {};
    if (contentQuery.orderBy) {
      order[contentQuery.orderBy] =
        contentQuery.orderDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    }
  
    const [data, total] = await Content.findAndCount({
      where,
      order,
      skip: (contentQuery.page - 1) * contentQuery.limit,
      take: contentQuery.limit,
    });
  
    return {
      data,
      total,
      page: +contentQuery.page,
      limit: +contentQuery.limit,
    };
  }

  async update(
    courseId: string,
    id: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findByCourseIdAndId(courseId, id);
    return await Content.create({ id: content.id, ...updateContentDto }).save();
  }

  async delete(courseId: string, id: string): Promise<string> {
    const content = await this.findByCourseIdAndId(courseId, id);
    await Content.delete(content);
    return id;
  }

  async count(): Promise<number> {
    return await Content.count();
  }
}
