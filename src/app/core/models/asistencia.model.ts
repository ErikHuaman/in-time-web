export interface Asistencia {
  id: string;
  idDispositivo: string;
  idTrabajador: string;
  idHorarioTrabajador: string;
  idHorarioTrabajadorItem: string;
  fecha: Date;
  marcacionEntrada: Date;
  diferenciaEntrada: number;
  marcacionSalida: Date;
  diferenciaSalida: number;
}
