import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Dispositivo } from '@models/dispositivo.model';

@Injectable({
  providedIn: 'root',
})
export class DispositivoService {
  private readonly url = `${environment.urlBase}v1/dispositivos`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<Dispositivo[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Dispositivo[]) => data)
    );
  }

  findOne(id: string): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${this.url}/${id}`);
  }

  create(dto: Dispositivo): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(`${this.url}`, dto);
  }

  update(id: string, dto: Dispositivo): Observable<Dispositivo> {
    return this.http.patch<Dispositivo>(`${this.url}/${id}`, dto);
  }
}
