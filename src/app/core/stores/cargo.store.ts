import { CargoService } from '@services/cargo.service';
import { createEntityStore } from './generic/createEntityStore';
import { Cargo } from '@models/cargo.model';

export const CargoStore = createEntityStore<Cargo>({
  serviceToken: CargoService,
  entityName: 'Cargo',
});
