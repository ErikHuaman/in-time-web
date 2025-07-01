import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { ReemplazoHorario } from '@models/reemplazo-horario.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReemplazoHorarioService {
  private readonly url = `${environment.apiUrl}/reemplazoHorario`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<ReemplazoHorario[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: ReemplazoHorario[]) => data)
    );
  }

  findOne(id: string): Observable<ReemplazoHorario> {
    return this.http.get<ReemplazoHorario>(`${this.url}/${id}`);
  }

  create(dto: ReemplazoHorario): Observable<ReemplazoHorario> {
    return this.http.post<ReemplazoHorario>(`${this.url}`, dto);
  }

  update(id: string, dto: ReemplazoHorario): Observable<ReemplazoHorario> {
    return this.http.patch<ReemplazoHorario>(`${this.url}/${id}`, dto);
  }

  changeStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
