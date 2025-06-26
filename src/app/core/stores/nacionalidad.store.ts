import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { Ciudad, Pais, Provincia, Region } from '@models/nacionalidad.model';
import { NacionalidadService } from '@services/nacionalidad.service';

export interface NacionalidadState {
  pais: Pais | undefined;
  paises: Pais[];
  regiones: Region[];
  provincias: Provincia[];
  ciudades: Ciudad[];
  loading: boolean;
  error: string | undefined;
}

const initialState: NacionalidadState = {
  pais: undefined,
  paises: [],
  regiones: [],
  provincias: [],
  ciudades: [],
  loading: false,
  error: undefined,
};

export const NacionalidadStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(NacionalidadService);
    return {
      getPaisByIso3(iso: string) {
        patchState(store, { loading: true });
        service
          .getPaisByIso3(iso)
          .pipe(
            tap({
              next: (item: Pais) =>
                patchState(store, { pais: item, loading: false }),
              error: (e) =>
                patchState(store, {
                  error: `[País] ${e?.error?.message}`,
                  loading: false,
                }),
            })
          )
          .subscribe();
      },

      getPaises() {
        patchState(store, { loading: true });
        service
          .getPaises()
          .pipe(
            tap({
              next: (items: Pais[]) =>
                patchState(store, { paises: items, loading: false }),
              error: (e) =>
                patchState(store, {
                  error: `[País] ${e?.error?.message}`,
                  loading: false,
                }),
            })
          )
          .subscribe();
      },

      getRegiones(idPais: string) {
        patchState(store, {
          provincias: [],
          ciudades: [],
          loading: true,
          error: undefined,
        });
        service
          .getRegiones(idPais)
          .pipe(
            tap({
              next: (items: Region[]) =>
                patchState(store, {
                  regiones: items,
                  loading: false,
                }),
              error: (e) =>
                patchState(store, {
                  error: `[Región] ${e?.error?.message}`,
                  loading: false,
                }),
            })
          )
          .subscribe();
      },

      getProvincias(idRegion: string) {
        patchState(store, {
          ciudades: [],
          loading: true,
          error: undefined,
        });
        service
          .getProvincias(idRegion)
          .pipe(
            tap({
              next: (items: Provincia[]) =>
                patchState(store, {
                  provincias: items,
                  loading: false,
                }),
              error: (e) =>
                patchState(store, {
                  error: `[Provincia] ${e?.error?.message}`,
                  loading: false,
                }),
            })
          )
          .subscribe();
      },

      getCiudades(idProvincia: string) {
        patchState(store, { loading: true, error: undefined });
        service
          .getCiudades(idProvincia)
          .pipe(
            tap({
              next: (items: Ciudad[]) =>
                patchState(store, { ciudades: items, loading: false }),
              error: (e) =>
                patchState(store, {
                  error: `[Ciudad] ${e?.error?.message}`,
                  loading: false,
                }),
            })
          )
          .subscribe();
      },
    };
  })
);
