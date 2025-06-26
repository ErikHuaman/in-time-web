import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { PatronHorario } from '@models/patron-horario.model';

@Injectable({
  providedIn: 'root',
})
export class PatronHorarioService {
  private readonly url = `${environment.apiUrl}/patronesHorario`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<PatronHorario[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: PatronHorario[]) => data)
    );
  }

  findOne(id: string): Observable<PatronHorario> {
    return this.http.get<PatronHorario>(`${this.url}/${id}`);
  }

  create(dto: PatronHorario): Observable<PatronHorario> {
    return this.http.post<PatronHorario>(`${this.url}`, dto);
  }

  update(id: string, dto: PatronHorario): Observable<PatronHorario> {
    return this.http.put<PatronHorario>(`${this.url}/${id}`, dto);
  }
}
