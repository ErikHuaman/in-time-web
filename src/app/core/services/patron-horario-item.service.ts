import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { PatronHorarioItem } from '@models/patron-horario-item.model';

@Injectable({
  providedIn: 'root',
})
export class PatronHorarioItemService {
  private readonly url = `${environment.apiUrl}/patronHorarioItems`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<PatronHorarioItem[]> {
    return this.http.get<PatronHorarioItem[]>(this.url);
  }

  findOne(id: string): Observable<PatronHorarioItem> {
    return this.http.get<PatronHorarioItem>(`${this.url}/${id}`);
  }

  create(dto: PatronHorarioItem): Observable<PatronHorarioItem> {
    return this.http.post<PatronHorarioItem>(`${this.url}`, dto);
  }

  createMany(listDTO: PatronHorarioItem[]): Observable<PatronHorarioItem[]> {
    return this.http.post<PatronHorarioItem[]>(`${this.url}/multiple`, listDTO);
  }

  update(id: string, dto: PatronHorarioItem): Observable<PatronHorarioItem> {
    return this.http.put<PatronHorarioItem>(`${this.url}/${id}`, dto);
  }
}
