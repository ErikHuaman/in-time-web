import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { SeguroSalud } from '@models/seguro-salud.model';

@Injectable({
  providedIn: 'root',
})
export class SeguroSaludService {
  private readonly url = `${environment.urlBase}v1/seguroSalud`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<SeguroSalud[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: SeguroSalud[]) => data)
    );
  }

  update(id: string, dto: SeguroSalud): Observable<SeguroSalud> {
    return this.http.patch<SeguroSalud>(`${this.url}/${id}`, dto);
  }

  updateMany(dto: SeguroSalud[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/multiple`, dto);
  }
}
