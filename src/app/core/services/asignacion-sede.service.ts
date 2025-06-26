import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { AsignacionSede } from '@models/asignacion-sede.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsignacionSedeService {
  private readonly url = `${environment.apiUrl}/asignacionSede`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<AsignacionSede[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: AsignacionSede[]) => data)
    );
  }

  findOne(id: string): Observable<AsignacionSede> {
    return this.http.get<AsignacionSede>(`${this.url}/${id}`);
  }

  findAllByTrabajador(idTrabajador: string): Observable<AsignacionSede[]> {
    return this.http.get<AsignacionSede[]>(
      `${this.url}/byTrabajador/${idTrabajador}`
    );
  }

  create(dto: AsignacionSede): Observable<AsignacionSede> {
    return this.http.post<AsignacionSede>(`${this.url}`, dto);
  }

  multipleCreate(dto: AsignacionSede[]): Observable<AsignacionSede[]> {
    return this.http.post<AsignacionSede[]>(`${this.url}/multiple`, dto);
  }

  update(id: string, dto: AsignacionSede): Observable<AsignacionSede> {
    return this.http.put<AsignacionSede>(`${this.url}/${id}`, dto);
  }
}
