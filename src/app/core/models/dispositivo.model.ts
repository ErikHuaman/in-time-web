import { Sede } from './sede.model';

export interface Dispositivo {
  id: string;
  nombre: string;
  codigo: string;
  idSede: string;
  isActive: boolean;
  sede?: Sede;
}
