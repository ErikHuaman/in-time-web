export interface JustificacionInasistencia {
  id?: string;
  idTrabajador?: string;
  idHorarioTrabajador?: string;
  idHorarioTrabajadorItem?: string;
  nota?: string;
  fecha?: Date;
  conGoce?: boolean;
  incluirExtra?: boolean;
  archivo?: File;
}
