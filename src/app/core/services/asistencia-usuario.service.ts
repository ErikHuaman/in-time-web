import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaUsuarioService {
  private readonly url = `${environment.apiUrl}/asistenciaUsuario`;

  private readonly http = inject(HttpClient);

  findAllByMonth(fecha: Date): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.url}/ByMonth`,
      { fecha }
    );
  }
}
