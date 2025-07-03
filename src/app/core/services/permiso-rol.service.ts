import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { PermisoRol } from '@models/permiso-rol.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermisoRolService {
private readonly url = `${environment.urlBase}v1/permisoRoles`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<PermisoRol[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: PermisoRol[]) => data)
    );
  }

  findOne(id: string): Observable<PermisoRol> {
    return this.http.get<PermisoRol>(`${this.url}/${id}`);
  }

  create(dto: PermisoRol): Observable<PermisoRol> {
    return this.http.post<PermisoRol>(`${this.url}`, dto);
  }

  multipleCreate(
    dto: PermisoRol[]
  ): Observable<PermisoRol[]> {
    return this.http.post<PermisoRol[]>(`${this.url}/multiple`, dto);
  }

  update(
    id: string,
    dto: PermisoRol
  ): Observable<PermisoRol> {
    return this.http.patch<PermisoRol>(`${this.url}/${id}`, dto);
  }
}
