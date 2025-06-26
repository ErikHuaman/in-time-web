import { SedeService } from '@services/sede.service';
import { createEntityStore } from './generic/createEntityStore';
import { Sede } from '@models/sede.model';

export const SedeStore = createEntityStore<Sede>({
  serviceToken: SedeService,
  entityName: 'Sede',
});
