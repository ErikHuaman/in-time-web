import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Pais, Region, Provincia, Ciudad } from '@models/nacionalidad.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NacionalidadService {
  private readonly http = inject(HttpClient);

  getPaisByIso3(iso: string): Observable<Pais> {
    const url = `${environment.urlBase}v1/paises/${iso}`;
    return this.http.get<Pais>(url);
  }

  getPaises(): Observable<Pais[]> {
    const url = `${environment.urlBase}v1/paises`;
    return this.http.get<Pais[]>(url);
  }

  getRegiones(idPais: string): Observable<Region[]> {
    const url = `${environment.urlBase}v1/regiones/byPais/${idPais}`;
    return this.http.get<Region[]>(url);
  }

  getProvincias(idRegion: string): Observable<Provincia[]> {
    const url = `${environment.urlBase}v1/provincias/byRegion/${idRegion}`;
    return this.http.get<Provincia[]>(url);
  }

  getCiudades(idProvince: string): Observable<Ciudad[]> {
    const url = `${environment.urlBase}v1/ciudades/byProvincia/${idProvince}`;
    return this.http.get<Ciudad[]>(url);
  }
}
