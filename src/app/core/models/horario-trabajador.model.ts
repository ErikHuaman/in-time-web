import { HorarioTrabajadorItem } from "./horario-trabajador-item.model";
import { Trabajador } from "./trabajador.model";

export interface HorarioTrabajador {
  id?: string;
  idTrabajador?: string;
  idTurnoTrabajo?: string;
  idTipoTurno?: string;
  idPatronHorario?: string;
  items?: HorarioTrabajadorItem[];
  trabajador?: Trabajador;
}
