import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateContentDto, UpdateContentDto } from '../content/content.dto';
import { Content } from '../content/content.entity';
import { ContentQuery } from '../content/content.query';
import { ContentService } from '../content/content.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import { Course } from './course.entity';
import { CourseQuery } from './course.query';
import { CourseService } from './course.service';
import { PaginationResponse } from 'src/shared/pagination-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly contentService: ContentService,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Editor)
  async save(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.save(createCourseDto);
  }

  @Get()
  async findAll(
    @Query() courseQuery: CourseQuery,
  ): Promise<PaginationResponse<Course>> {
    return await this.courseService.findAll(courseQuery);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return await this.courseService.findById(id);
  }

  @Put('/:id')
  @Roles(Role.Admin, Role.Editor)
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return await this.courseService.update(id, updateCourseDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  async delete(@Param('id') id: string): Promise<string> {
    return await this.courseService.delete(id);
  }

  @Post('/:id/contents')
  @Roles(Role.Admin, Role.Editor)
  async saveContent(
    @Param('id') id: string,
    @Body() createContentDto: CreateContentDto,
  ): Promise<Content> {
    return await this.contentService.save(id, createContentDto);
  }

  @Get('/:id/contents')
  async findAllContentsByCourseId(
    @Param('id') id: string,
    @Query() contentQuery: ContentQuery,
  ): Promise<PaginationResponse<Content>> {
    return await this.contentService.findAllByCourseId(id, contentQuery);
  }

  @Put('/:id/contents/:contentId')
  @Roles(Role.Admin, Role.Editor)
  async updateContent(
    @Param('id') id: string,
    @Param('contentId') contentId: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    return await this.contentService.update(id, contentId, updateContentDto);
  }

  @Delete('/:id/contents/:contentId')
  @Roles(Role.Admin)
  async deleteContent(
    @Param('id') id: string,
    @Param('contentId') contentId: string,
  ): Promise<string> {
    return await this.contentService.delete(id, contentId);
  }

  @Post(':id/img')
  @Roles(Role.Admin)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  uploadReceipt(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required!');
    }
    return this.courseService.uploadImg(id, file.originalname, file.buffer);
  }


  @Roles(Role.Admin)
  @Get(':id/img')
  getReceipt(@Param('id') id: string) {
    return this.courseService.getImgUrl(id);
  }
}
