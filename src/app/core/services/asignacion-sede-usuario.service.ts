import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { AsignacionSedeUsuario } from '@models/asignacion-sede-usuario.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsignacionSedeUsuarioService {
  private readonly url = `${environment.urlBase}v1/asignacionSedeUsuario`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<AsignacionSedeUsuario[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: AsignacionSedeUsuario[]) => data)
    );
  }

  findOne(id: string): Observable<AsignacionSedeUsuario> {
    return this.http.get<AsignacionSedeUsuario>(`${this.url}/${id}`);
  }

  findAllByUsuario(idUsuario: string): Observable<AsignacionSedeUsuario[]> {
    return this.http.get<AsignacionSedeUsuario[]>(
      `${this.url}/ByUsuario/${idUsuario}`
    );
  }

  create(dto: AsignacionSedeUsuario): Observable<AsignacionSedeUsuario> {
    return this.http.post<AsignacionSedeUsuario>(`${this.url}`, dto);
  }

  multipleCreate(
    dto: AsignacionSedeUsuario[]
  ): Observable<AsignacionSedeUsuario[]> {
    return this.http.post<AsignacionSedeUsuario[]>(`${this.url}/multiple`, dto);
  }

  update(
    id: string,
    dto: AsignacionSedeUsuario
  ): Observable<AsignacionSedeUsuario> {
    return this.http.patch<AsignacionSedeUsuario>(`${this.url}/${id}`, dto);
  }
}
