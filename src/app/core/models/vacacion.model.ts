import { Sede } from "./sede.model";
import { Trabajador } from "./trabajador.model";

export interface Vacacion {
  id?: string;
  idSede?: string;
  idCargo?: string;
  idTrabajador?: string;
  diasDisponibles?: number;
  diasUtilizados?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  trabajador?: Trabajador;
  sede?: Sede;
}
