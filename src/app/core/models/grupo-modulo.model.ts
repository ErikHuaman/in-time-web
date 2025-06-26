import { MenuItem } from "primeng/api";
import { PermisoRol } from "./permiso-rol.model";

export interface GrupoModulo {
  id: string;
  nombre: string;
  modulos: Modulo[];
}

export interface Modulo {
  id: string;
  nombre: string;
  codigo: string;
  url: string;
  icono: string;
  idGrupoModulo: string;
  grupoModulo: GrupoModulo;
  permisos: PermisoRol;
}

export interface GrupoMenuItem {
  label: string;
  menu: MenuItem[];
}