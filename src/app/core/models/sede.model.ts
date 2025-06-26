import { AsignacionSede } from './asignacion-sede.model';
import { Ciudad } from './nacionalidad.model';

export interface Sede {
  id: string;
  orden: number;
  nombre: string;
  ruc: string;
  razonSocial: string;
  direccion: string;
  latitud: string;
  longitud: string;
  idCiudad: string;
  ciudad?: Ciudad;
  AsignacionSede?: AsignacionSede;
  isActive: boolean;
}
