export interface PermisoRol {
    idRol: string;
    idModulo: string;
    leer: boolean;
    todos?: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    isActive: boolean;
}