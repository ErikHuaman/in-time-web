import { Trabajador } from "./trabajador.model";

export interface InactivacionTrabajador {
  id?: string;
  idTrabajador?: string;
  motivoSuspension?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  nota?: string;
  isActive?: boolean;
  trabajador?: Trabajador;
}
