import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Adelanto } from '@models/adelanto.model';

@Injectable({
  providedIn: 'root',
})
export class AdelantoService {
  private readonly url = `${environment.apiUrl}/adelantos`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<Adelanto[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Adelanto[]) => data)
    );
  }

  findOne(id: string): Observable<Adelanto> {
    return this.http.get<Adelanto>(`${this.url}/${id}`);
  }

  create(dto: Adelanto): Observable<Adelanto> {
    return this.http.post<Adelanto>(`${this.url}`, dto);
  }

  update(id: string, dto: Adelanto): Observable<Adelanto> {
    return this.http.put<Adelanto>(`${this.url}/${id}`, dto);
  }
}
