import { BloqueHoras } from './bloque-horas.model';
import { Sede } from './sede.model';

export interface HorarioTrabajadorItem {
  id?: string;
  numDia?: number;
  numTurno?: number;
  diaLibre?: boolean;
  diaDescanso?: boolean;
  idBloqueHoras?: string;
  idHorarioTrabajador?: string;
  idSede?: string;
  bloque?: BloqueHoras;
  sede?: Sede;
}
