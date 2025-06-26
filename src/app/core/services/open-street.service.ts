import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenStreetService {
  private readonly http = inject(HttpClient);

  searchByDirection(query: string): Observable<any[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&accept-language=es&countrycodes=pe&layer=address&q=${query}`;
    return this.http.get<any[]>(url).pipe(
      map((data) => {
        return data.filter((d) => !['state','region'].includes(d.addresstype));
      })
    );
  }

  getAddressFromCoords(lat: string, lon: string): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    return this.http.get<any>(url);
  }
}
