import { PermisoTrabajadorService } from '@services/permiso-trabajador.service';
import { createEntityStore } from './generic/createEntityStore';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';

export const PermisoTrabajadorStore = createEntityStore<PermisoTrabajador>({
  serviceToken: PermisoTrabajadorService,
  entityName: 'PermisoTrabajador',
});
