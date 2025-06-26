import { Sede } from "./sede.model";

export interface AsignacionSede{
    id: string,
    orden: number;
    idTrabajador: string,
    idSede: string;
    fechaAsignacion: Date;
    isActive: boolean;
    sede: Sede;
}