import Course from '../models/course/Course';
import CourseQuery from '../models/course/CourseQuery';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import UpdateCourseRequest from '../models/course/UpdateCourseRequest';
import { PaginationResponse } from '../models/shared/PaginationResponse';
import apiService from './ApiService';

class UserService {
  async save(createCourseRequest: CreateCourseRequest): Promise<void> {
    await apiService.post('/api/courses', createCourseRequest);
  }

  async findAll(courseQuery: CourseQuery): Promise<PaginationResponse<Course>> {
    return (
      await apiService.get<PaginationResponse<Course>>('/api/courses', {
        params: courseQuery,
      })
    ).data;
  }

  async findOne(id: string): Promise<Course> {
    return (await apiService.get<Course>(`/api/courses/${id}`)).data;
  }

  async update(
    id: string,
    updateCourseRequest: UpdateCourseRequest,
  ): Promise<void> {
    await apiService.put(`/api/courses/${id}`, updateCourseRequest);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/courses/${id}`);
  }

  async uploadImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post(`/api/courses/${id}/img`, formData);
  }


  async getImg(id: string): Promise<{ imgUrl: string }> {
    return (await apiService.get(`/api/courses/${id}/img`)).data;

  }
}

export default new UserService();
