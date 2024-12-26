export default interface CourseQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  orderDirection?: 'ASC' | 'DESC';
}
