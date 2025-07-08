
import { HorarioTrabajadorService } from '@services/horario-trabajador.service';
import { createEntityStore } from './generic/createEntityStore';
import { HorarioTrabajador } from '@models/horario-trabajador.model';

export const HorarioTrabajadorStore = createEntityStore<HorarioTrabajador>({
  serviceToken: HorarioTrabajadorService,
  entityName: 'HorarioTrabajador',
});
