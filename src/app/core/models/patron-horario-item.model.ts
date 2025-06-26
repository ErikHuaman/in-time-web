import { BloqueHoras } from './bloque-horas.model';

export interface PatronHorarioItem {
  id?: string;
  numDia?: number;
  numTurno?: number;
  diaLibre?: boolean;
  diaDescanso?: boolean;
  idBloqueHoras?: string;
  idPatronHorario?: string;
  bloque?: BloqueHoras;
}
