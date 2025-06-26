import { TipoDocIdentService } from '@services/tipo-doc-ident.service';
import { createEntityStore } from './generic/createEntityStore';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';

export const TipoDocIdentStore = createEntityStore<TipoDocIdent>({
  serviceToken: TipoDocIdentService,
  entityName: 'TipoDocIdent',
});
