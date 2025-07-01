import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Vacacion } from '@models/vacacion.model';

@Injectable({
  providedIn: 'root',
})
export class VacacionService {
  private readonly url = `${environment.apiUrl}/vacaciones`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<Vacacion[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Vacacion[]) => data)
    );
  }

  findOne(id: string): Observable<Vacacion> {
    return this.http.get<Vacacion>(`${this.url}/${id}`);
  }

  create(dto: Vacacion): Observable<Vacacion> {
    return this.http.post<Vacacion>(`${this.url}`, dto);
  }

  update(id: string, dto: Vacacion): Observable<Vacacion> {
    return this.http.patch<Vacacion>(`${this.url}/${id}`, dto);
  }
}
