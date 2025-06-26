export interface PermisoTrabajador {
  id?: string;
  idSede?: string;
  idCargo?: string;
  idTrabajador?: string;
  nota?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  conGoce?: boolean;
  incluirExtra?: boolean;
  archivo?: File;
}
