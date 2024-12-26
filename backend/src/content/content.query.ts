export class ContentQuery {
  name?: string;
  description?: string;
  page?: number;
  limit?: number;
  orderBy?: 'dateCreated';
  orderDirection?: 'ASC' | 'DESC';
}
