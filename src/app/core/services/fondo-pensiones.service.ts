import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { FondoPensiones } from '@models/fondo-pensiones.model';

@Injectable({
  providedIn: 'root',
})
export class FondoPensionesService {
  private readonly url = `${environment.apiUrl}/fondoPensiones`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<any> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: FondoPensiones[]) => data)
    );
  }

  update(id: string, dto: FondoPensiones): Observable<FondoPensiones> {
    return this.http.patch<FondoPensiones>(`${this.url}/${id}`, dto);
  }

  updateMany(dto: FondoPensiones[]): Observable<any> {
    return this.http.post<boolean>(`${this.url}/multiple`, dto);
  }
}
