import { Trabajador } from './trabajador.model';

export interface Adelanto {
  id?: string;
  idSede?: string;
  idCargo?: string;
  idTrabajador?: string;
  montoAdelanto?: number;
  cuotasDescuento?: number;
  fechaAdelanto?: Date;
  fechaDescuento?: Date;
  trabajador?: Trabajador;
}
