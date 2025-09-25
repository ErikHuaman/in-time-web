import { AsistenciaService } from '@services/asistencia.service';
import { createEntityStore } from './generic/createEntityStore';
import { Asistencia } from '@models/asistencia.model';

export const AsistenciaStore = createEntityStore<Asistencia>({
  serviceToken: AsistenciaService,
  entityName: 'Asistencia',
});
