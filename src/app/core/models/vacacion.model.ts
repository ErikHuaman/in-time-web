export interface Vacacion {
  id?: string;
  idSede?: string;
  idCargo?: string;
  idTrabajador?: string;
  diasDisponibles?: number;
  diasUtilizados?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}
