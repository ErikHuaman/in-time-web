import { Trabajador } from "./trabajador.model";

export interface InactivacionTrabajador {
  id?: string;
  idTrabajador?: string;
  motivoSuspension?: string;
  fechaSuspension?: Date;
  nota?: string;
  isActive?: boolean;
  trabajador?: Trabajador;
}
