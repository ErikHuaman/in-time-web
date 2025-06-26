import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Trabajador } from '@models/trabajador.model';
import { map, Observable, of } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService extends GenericCrudService<Trabajador> {
  constructor(http: HttpClient) {
    super(http, 'trabajadores');
  }

  findAllActivos(): Observable<Trabajador[]> {
    return of([]);
  }

  findAllInactivos(): Observable<Trabajador[]> {
    return of([]);
  }

  findAllPagoByMonth(fechaSelected: Date): Observable<Trabajador[]> {
    return of([]);
  }

  findOnePagoByMonthAndIdTrabajador(
    id: string,
    mesSelected: Date
  ): Observable<Trabajador[]> {
    return of([]);
  }

  findAllPagoByMonthDescanseros(fechaSelected: Date): Observable<Trabajador[]> {
    return of([]);
  }
}
//  {
//   private readonly url = `${environment.apiUrl}/trabajador`;

//   private readonly http = inject(HttpClient);

//   findAll(): Observable<Trabajador[]> {
//     return this.http.get<Trabajador[]>(this.url);
//   }

//   findAllPagoByMonth(fecha: Date): Observable<any[]> {
//     return this.http.post<Trabajador[]>(`${this.url}/PagoByMonth`, {
//       fecha,
//     });
//   }

//   findAllPagoByMonthDescanseros(fecha: Date): Observable<any[]> {
//     return this.http.post<Trabajador[]>(`${this.url}/PagoByMonthDescanseros`, {
//       fecha,
//     });
//   }

//   findOnePagoByMonthAndIdTrabajador(id: string, fecha: Date): Observable<any> {
//     return this.http.post<Trabajador[]>(
//       `${this.url}/PagoByMonthAndIdTrabajador`,
//       {
//         id,
//         fecha,
//       }
//     );
//   }

//   findAllActivos(): Observable<Trabajador[]> {
//     return this.http.get<Trabajador[]>(`${this.url}/isActive`);
//   }

//   findAllInactivos(): Observable<Trabajador[]> {
//     return this.http.get<Trabajador[]>(`${this.url}/isInactive`);
//   }

//   findOne(id: string): Observable<Trabajador> {
//     return this.http.get<Trabajador>(`${this.url}/${id}`);
//   }

//   create(dto: Trabajador): Observable<Trabajador> {
//     return this.http.post<Trabajador>(`${this.url}`, dto);
//   }

//   update(id: string, dto: Trabajador): Observable<Trabajador> {
//     return this.http.put<Trabajador>(`${this.url}/${id}`, dto);
//   }

//   delete(id: string, force: boolean = false): Observable<void> {
//     return this.http.delete<void>(`${this.url}/${id}/${force}`);
//   }
// }
