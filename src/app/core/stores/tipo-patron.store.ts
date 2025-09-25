import { TipoPatron } from '@models/tipo-patron.model';
import { createEntityStore } from './generic/createEntityStore';
import { TipoPatronService } from '@services/tipo-patron.service';

export const TipoPatronStore = createEntityStore<TipoPatron>({
  serviceToken: TipoPatronService,
  entityName: 'TipoPatron',
});
