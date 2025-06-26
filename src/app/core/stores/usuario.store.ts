import { UsuarioService } from '@services/usuario.service';
import { createEntityStore } from './generic/createEntityStore';
import { Usuario } from '@models/usuario.model';

export const UsuarioStore = createEntityStore<Usuario>({
  serviceToken: UsuarioService,
  entityName: 'Usuario',
});
