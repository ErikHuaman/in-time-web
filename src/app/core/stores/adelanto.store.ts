import { AdelantoService } from '@services/adelanto.service';
import { createEntityStore } from './generic/createEntityStore';
import { Adelanto } from '@models/adelanto.model';

export const AdelantoStore = createEntityStore<Adelanto>({
  serviceToken: AdelantoService,
  entityName: 'Adelanto',
});
