import { Sede } from './sede.model';

export interface AsignacionSedeUsuario {
  idUsuario: string;
  idSede: string;
  isActive?: boolean;
  sede?: Sede;
}
