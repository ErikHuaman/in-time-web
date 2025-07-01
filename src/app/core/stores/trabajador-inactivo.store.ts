import { TrabajadorService } from '@services/trabajador.service';
import { createEntityStore } from './generic/createEntityStore';
import { Trabajador } from '@models/trabajador.model';

export const TrabajadorInactivoStore = createEntityStore<Trabajador>({
  serviceToken: TrabajadorService,
  entityName: 'Trabajador',
});
