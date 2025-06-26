import { Reemplacero } from './reemplacero.model';
import { Trabajador } from './trabajador.model';

export interface ReemplazoHorario {
  id?: string;
  idTrabajador?: string;
  idReemplacero?: string;
  nota?: string;
  isActive?: string;
  trabajador?: Trabajador;
  reemplacero?: Reemplacero;
}
