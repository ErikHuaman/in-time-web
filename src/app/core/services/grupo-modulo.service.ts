import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { GrupoModulo } from '@models/grupo-modulo.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GrupoModuloService {
  private readonly url = `${environment.urlBase}v1/grupoModulos`;

  private readonly http = inject(HttpClient);

  findAll(filter: boolean = true): Observable<GrupoModulo[]> {
    // return this.http.get<GrupoModulo[]>(`${this.url}?filter=${filter}`);
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: GrupoModulo[]) => data)
    );
  }

  findAllPermisos(): Observable<GrupoModulo[]> {
    return this.http.get<GrupoModulo[]>(`${this.url}/permisos`);
  }

  findOne(id: string): Observable<GrupoModulo> {
    return this.http.get<GrupoModulo>(`${this.url}/${id}`);
  }

  create(dto: GrupoModulo): Observable<GrupoModulo> {
    return this.http.post<GrupoModulo>(`${this.url}`, dto);
  }

  update(id: string, dto: GrupoModulo): Observable<GrupoModulo> {
    return this.http.patch<GrupoModulo>(`${this.url}/${id}`, dto);
  }

  changeStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
