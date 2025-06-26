import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { HorarioTrabajador } from '@models/horario-trabajador.model';

@Injectable({
  providedIn: 'root',
})
export class HorarioTrabajadorService {
  private readonly url = `${environment.apiUrl}/horarioTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<any> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: HorarioTrabajador[]) =>
        data.map((item) => {
          if (item.trabajador) {
            const max = Math.max(
              ...(item?.trabajador?.sedes ?? []).map((a) => a.orden)
            );
            item.trabajador.sedes =
              item.trabajador.sedes.filter((a) => a.orden === max);
          }
          return item;
        })
      )
    );
  }

  findOne(id: string): Observable<HorarioTrabajador> {
    return this.http.get<HorarioTrabajador>(`${this.url}/${id}`);
  }

  create(dto: HorarioTrabajador): Observable<HorarioTrabajador> {
    return this.http.post<HorarioTrabajador>(`${this.url}`, dto);
  }

  update(id: string, dto: HorarioTrabajador): Observable<HorarioTrabajador> {
    return this.http.put<HorarioTrabajador>(`${this.url}/${id}`, dto);
  }
}
