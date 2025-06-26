import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private readonly url = '/test/horarios.json';

  private readonly http = inject(HttpClient);

  getHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
}
