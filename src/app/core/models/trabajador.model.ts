import { AsignacionSede } from './asignacion-sede.model';
import { Cargo } from './cargo.model';
import { InactivacionTrabajador } from './inactivacionTrabajador.model';
import { Ciudad } from './nacionalidad.model';
import { RegistroBiometrico } from './registro-biometrico.model';
import { Sede } from './sede.model';
import { TurnoTrabajo } from './turno-trabajo.model';

export interface Trabajador {
  id?: string;
  nombre?: string;
  apellido?: string;
  genero?: string;
  idPais?: string;
  idTipoDocID?: string;
  identificacion?: string;
  idEstadoCivil?: string;

  contratos: ContratoTrabajador[];
  biometricos: RegistroBiometrico[];
  infos: InfoTrabajador[];
  contactos: ContactoTrabajador[];
  beneficios: BeneficioTrabajador[];
  controles: ControlTrabajador[];
  sedes: Sede[];
  isActive: boolean;
  asistencia: any[];

  labelName?: string;
  inactivaciones: InactivacionTrabajador[];
}

export interface ContratoTrabajador {
  id?: string;
  numNomina?: string;
  horasContrato?: number;
  salarioMensual?: number;
  idCargo?: string;
  idFrecuenciaPago?: string;
  idTiempoContrato?: string;
  fechaContrato?: Date;
  fechaInicio?: Date;
  idTrabajador?: string;
  cargo: Cargo;
}

export interface InfoTrabajador {
  id?: string;
  idCiudad?: string;
  ciudad?: Ciudad;
  direccion?: string;
  celular?: string;
  correo?: string;
  idTrabajador?: string;
}

export interface ContactoTrabajador {
  id?: string;
  nombre?: string;
  apellido?: string;
  parentezco?: string;
  celular?: string;
  correo?: string;
  idTrabajador?: string;
}

export interface BeneficioTrabajador {
  id?: string;
  idFondoPensiones?: string;
  idSeguroSalud?: string;
  idTrabajador?: string;
  pagoFeriado?: number
}

export interface ControlTrabajador {
  id?: string;
  idTurnoTrabajo?: string;
  turnoTrabajo?: TurnoTrabajo;
  marcacionAutomatica?: boolean;
  idTrabajador?: string;
}
