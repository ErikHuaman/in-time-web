import { HorarioTrabajadorItem } from './horario-trabajador-item.model';
import { TipoPatron } from './tipo-patron.model';
import { Trabajador } from './trabajador.model';

export interface HorarioTrabajador {
  id?: string;
  idTrabajador?: string;
  idTurnoTrabajo?: string;
  idTipoTurno?: string;
  idTipoPatron?: string;
  idPatronHorario?: string;
  fechaInicio: Date;
  fechaFin: Date;
  items?: HorarioTrabajadorItem[];
  trabajador?: Trabajador;
  tipoPatron?: TipoPatron;
}
