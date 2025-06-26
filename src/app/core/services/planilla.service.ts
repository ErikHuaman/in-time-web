import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  private readonly url = '/test/planillas.json';

  private readonly http = inject(HttpClient);

  getPlanillas(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }
}
