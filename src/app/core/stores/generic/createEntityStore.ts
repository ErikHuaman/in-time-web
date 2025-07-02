import {
  signalStore,
  withState,
  withMethods,
  patchState,
  withComputed,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { tap } from 'rxjs'; // Define esta interfaz como arriba
import { CrudService } from '@interfaces/crud-service.interface';
import { PaginatedResponse } from '@interfaces/paginated-response.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface EntityState<T> {
  totalItems: number;
  limit: number;
  offset: number;
  items: T[];
  selectedItem: T | null;
  loading: boolean;
  previewUrl: SafeUrl;
  error: string | null;
  lastAction: 'created' | 'updated' | 'deleted' | 'createMany' | null;
}

export function createEntityStore<T>(options: {
  serviceToken: any; // El token de inyección del servicio
  entityName?: string; // opcional, solo para logging
}) {
  const initialState: EntityState<T> = {
    totalItems: 0,
    limit: 10,
    offset: 0,
    items: [],
    selectedItem: null,
    previewUrl: '',
    loading: false,
    error: null,
    lastAction: null,
  };

  return signalStore(
    { providedIn: 'root' },
    withState(initialState),
    // withComputed(({ items }) => ({
    //   total: computed(() => items().length),
    // })),
    withMethods((store) => {
      const service = inject<CrudService<T>>(options.serviceToken);
      const sanitizer = inject(DomSanitizer);
      const entity = options.entityName ?? 'Entity';

      return {
        loadAll(limit?: number, offset?: number, q?: Record<string, any>) {
          patchState(store, { loading: true, error: null });
          service
            .getAll(limit, offset, q)
            .pipe(
              tap({
                next: (res: PaginatedResponse<T>) => {
                  patchState(store, {
                    totalItems: res.total,
                    limit: res.limit,
                    offset: res.offset,
                    items: res.data,
                    loading: false,
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        loadById(id: string | string, query?: string) {
          patchState(store, { loading: true, error: null });
          service
            .findOne(id, query)
            .pipe(
              tap({
                next: (item) =>
                  patchState(store, { selectedItem: item, loading: false }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        create(data: Partial<T>, ext?: { file?: File }) {
          patchState(store, { loading: true, error: null });
          service
            .create(data, ext)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    items: [],
                    loading: false,
                    lastAction: 'created',
                  }),
                error: (err) => {
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  });
                },
              })
            )
            .subscribe();
        },

        createMany(data: any[]) {
          patchState(store, { loading: true, error: null });
          service
            .createMany(data)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    loading: false,
                    lastAction: 'createMany',
                  }),
                error: (err) => {
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  });
                },
              })
            )
            .subscribe();
        },

        update(id: string | string, data: Partial<T>, ext?: { file?: File }) {
          patchState(store, { loading: true, error: null });
          service
            .update(id, data, ext)
            .pipe(
              tap({
                next: (data) =>
                  patchState(store, {
                    items: [],
                    loading: false,
                    lastAction: 'updated',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        delete(id: string | string) {
          patchState(store, { loading: true, error: null });
          service
            .delete(id)
            .pipe(
              tap({
                next: () =>
                  patchState(store, {
                    items: [],
                    selectedItem: null,
                    loading: false,
                    lastAction: 'deleted',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        changeStatus(id: string | string, status: boolean) {
          patchState(store, { loading: true, error: null });
          service
            .changeStatus(id, status)
            .pipe(
              tap({
                next: (item) =>
                  patchState(store, {
                    items: [],
                    selectedItem: null,
                    loading: false,
                    lastAction: 'deleted',
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        getFile(id: string | string) {
          patchState(store, { previewUrl: '' });
          service
            .getFile(id)
            .pipe(
              tap({
                next: (blob) =>
                  patchState(store, {
                    previewUrl: sanitizer.bypassSecurityTrustUrl(
                      window.URL.createObjectURL(blob)
                    ),
                  }),
                error: (err) =>
                  patchState(store, {
                    error: `[${entity}] ${err?.error?.message}`,
                    loading: false,
                  }),
              })
            )
            .subscribe();
        },

        clearAll() {
          patchState(store, {
            items: [],
            selectedItem: null,
            loading: false,
            error: null,
            lastAction: null,
          });
        },

        clearSelected() {
          patchState(store, {
            selectedItem: null,
            loading: false,
            error: null,
            lastAction: null,
          });
        },
      };
    })
  );
}
