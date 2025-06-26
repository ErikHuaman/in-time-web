import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';
import { toFormData } from '@functions/formData.function';

@Injectable({
  providedIn: 'root',
})
export class PermisoTrabajadorService {
  private readonly url = `${environment.apiUrl}/permisosTrabajador`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<PermisoTrabajador[]> {
    return this.http.get<PermisoTrabajador[]>(this.url);
  }

  findOne(id: string): Observable<PermisoTrabajador> {
    return this.http.get<PermisoTrabajador>(`${this.url}/${id}`);
  }

  create(dto: PermisoTrabajador): Observable<PermisoTrabajador> {
      const formData: FormData = toFormData(dto);
    return this.http.post<PermisoTrabajador>(`${this.url}`, formData);
  }

  update(id: string, dto: PermisoTrabajador): Observable<PermisoTrabajador> {
    return this.http.put<PermisoTrabajador>(`${this.url}/${id}`, dto);
  }
}
