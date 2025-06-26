import { Observable } from 'rxjs';
import { PaginatedResponse } from './paginated-response.interface';

export interface CrudService<T> {
  getAll(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<T>>;
  findOne(id: number | string, query?: string): Observable<T>;
  create(data: Partial<T>, ext?: { file?: File }): Observable<T>;
  createMany(data: Partial<T>[]): Observable<T[]>;
  update(
    id: number | string,
    data: Partial<T>,
    ext?: { file?: File }
  ): Observable<T>;
  delete(id: number | string): Observable<void>;
  getFile(id: number | string): Observable<Blob>;
}
