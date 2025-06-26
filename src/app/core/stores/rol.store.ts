import { RolService } from '@services/rol.service';
import { createEntityStore } from './generic/createEntityStore';
import { Rol } from '@models/rol.model';
export const RolStore = createEntityStore<Rol>({
  serviceToken: RolService,
  entityName: 'Rol',
});
