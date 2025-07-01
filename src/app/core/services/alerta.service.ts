import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly url = `${environment.apiUrl}/alerta`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<any[]> {
    return this.http.get<any>(`${this.url}`).pipe(
      map((data: any) => data.data),
      map((data: any[]) => data)
    );
  }

  findOne(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post<any>(`${this.url}`, dto);
  }

  update(id: string, dto: any): Observable<any> {
    return this.http.patch<any>(`${this.url}/${id}`, dto);
  }

  changeStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  changeLeido(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/changeLeido/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
