import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { HorarioTrabajadorItem } from '@models/horario-trabajador-item.model';

@Injectable({
  providedIn: 'root',
})
export class HorarioTrabajadorItemService {
  private readonly url = `${environment.apiUrl}/horarioTrabajadorItems`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<HorarioTrabajadorItem[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: HorarioTrabajadorItem[]) => data)
    );
  }

  findOne(id: string): Observable<HorarioTrabajadorItem> {
    return this.http.get<HorarioTrabajadorItem>(`${this.url}/${id}`);
  }

  create(dto: HorarioTrabajadorItem): Observable<HorarioTrabajadorItem> {
    return this.http.post<HorarioTrabajadorItem>(`${this.url}`, dto);
  }

  createMany(
    listDTO: HorarioTrabajadorItem[]
  ): Observable<HorarioTrabajadorItem[]> {
    return this.http.post<HorarioTrabajadorItem[]>(
      `${this.url}/multiple`,
      listDTO
    );
  }

  update(
    id: string,
    dto: HorarioTrabajadorItem
  ): Observable<HorarioTrabajadorItem> {
    return this.http.patch<HorarioTrabajadorItem>(`${this.url}/${id}`, dto);
  }
}
