import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environments';
import { toFormData } from '@functions/formData.function';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { Observable } from 'rxjs';

export class GenericCrudService<T> {
  private readonly url!: string;

  constructor(protected http: HttpClient, endpoint: string) {
    this.url = `${environment.apiUrl}/${endpoint}`;
  }

  getAll(
    limit?: number,
    offset?: number,
    q?: Record<string, any>
  ): Observable<PaginatedResponse<T>> {
    const limitQ = limit ? `limit=${limit}&` : '';
    const offsetQ = offset ? `offset=${offset}&` : '';
    const query = q ? `q=${encodeURIComponent(JSON.stringify(q))}` : '';

    return this.http.get<PaginatedResponse<T>>(
      `${this.url}?${limitQ}${offsetQ}${query}`
    );
  }

  findOne(id: string, q?: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  create(dto: Partial<T>, ext?: { file?: File }): Observable<T> {
    if (ext) {
      const formData = new FormData();
      formData.append('dto', JSON.stringify(dto));
      if (ext.file) {
        formData.append('archivo', ext.file);
      }
      return this.http.post<T>(this.url, formData);
    }
    return this.http.post<T>(`${this.url}`, dto);
  }

  createMany(dto: Partial<T>[]): Observable<Partial<T>[]> {
    return this.http.post<T[]>(`${this.url}/multiple`, dto);
  }

  update(id: string, dto: Partial<T>, ext?: { file?: File }): Observable<T> {
    if (ext) {
      const formData = new FormData();
      formData.append('dto', JSON.stringify(dto));
      if (ext.file) {
        formData.append('archivo', ext.file);
      }
      return this.http.patch<T>(`${this.url}/${id}`, formData);
    }
    return this.http.patch<T>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Métodos opcionales específicos
  changeStatus?(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  obtenerArchivo?(id: string): Observable<Blob> {
    return this.http.get(`${this.url}/obtenerArchivo/${id}`, {
      responseType: 'blob',
    });
  }
}
