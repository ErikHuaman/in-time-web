import { Rol } from './rol.model';
import { Sede } from './sede.model';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  idTipoDocID: string;
  identificacion: string;
  username: string;
  password: string;
  idRol: string;
  rol: Rol;
  sedes: Sede[];
  isActive: boolean;
  archivo: File;
  archivoNombre: string;
}
