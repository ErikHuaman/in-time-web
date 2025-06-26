import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { SeguroSalud } from '@models/seguro-salud.model';

@Injectable({
  providedIn: 'root',
})
export class SeguroSaludService {
  private readonly url = `${environment.apiUrl}/seguroSalud`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<any> {
    return this.http.get<any>(this.url);
  }

  update(id: string, dto: SeguroSalud): Observable<SeguroSalud> {
    return this.http.put<SeguroSalud>(`${this.url}/${id}`, dto);
  }

  updateMany(dto: SeguroSalud[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/multiple`, dto);
  }
}
