import { PatronHorarioItem } from './patron-horario-item.model';

export interface PatronHorario {
  id?: string;
  nombre?: string;
  idTipoTurno: string;
  idTipoPatron: string;
  items?: PatronHorarioItem[];
}
