import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Modulo } from '@models/grupo-modulo.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModuloService {
  private readonly url = `${environment.urlBase}v1/modulos`;

  private readonly http = inject(HttpClient);

  findAll(filter: boolean = true): Observable<Modulo[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Modulo[]) => data)
    );
  }

  findAllByRol(id: string): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${this.url}/byRol/${id}`);
  }

  findOne(id: string): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.url}/${id}`);
  }

  create(dto: Modulo): Observable<Modulo> {
    return this.http.post<Modulo>(`${this.url}`, dto);
  }

  update(id: string, dto: Modulo): Observable<Modulo> {
    return this.http.patch<Modulo>(`${this.url}/${id}`, dto);
  }

  changeStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
