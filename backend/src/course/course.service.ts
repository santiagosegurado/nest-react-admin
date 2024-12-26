import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ILike } from 'typeorm';

import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';
import { PaginationResponse } from 'src/shared/pagination-response.dto';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class CourseService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || '';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY') || '';
    const secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';
    const sessionToken =
      this.configService.get<string>('AWS_SESSION_TOKEN') || '';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
    });
  }

  async save(createCourseDto: CreateCourseDto): Promise<Course> {
    return await Course.create({
      ...createCourseDto,
      dateCreated: new Date(),
    }).save();
  }

  async uploadImg(id: string, fileName: string, file: Buffer): Promise<Course> {
    const uniqueFileName = `${id}-${new Date().getTime()}-${fileName}`;
    const course = await this.update(id, {
      fileName: uniqueFileName,
      imgUrl: null,
    });

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: uniqueFileName,
        Body: file,
      }),
    );

    return course;
  }

  async getImgUrl(id: string) {
    const course = await this.findById(id);

    if (course.fileName === null) {
      throw new BadRequestException('No file uploaded');
    }

    const command = new GetObjectCommand({
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Key: course.fileName,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 43200,
    });

    return this.update(id, {
      imgUrl: url,
    });
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
