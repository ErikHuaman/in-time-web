import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { redirectIfLoggedInGuard } from './core/guards/redirect-if-logged-in.guard';
import { verifyModuloGuard } from './core/guards/verify-modulo.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    title: 'Iniciar Sesión | In Time',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'auth/reset-password',
    title: 'SAT | Restablecer contraseña',
    canActivate: [redirectIfLoggedInGuard],
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [verifyModuloGuard],
    loadComponent: () =>
      import('./main/main.component').then((c) => c.MainComponent),
    children: [
      /* Rutas de organización */
      {
        path: '',
        title: 'Inicio | In Time',
        loadComponent: () =>
          import('./main/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'organizacion/trabajadores-activos',
        title: 'Trabajadores activos | In Time',
        loadComponent: () =>
          import(
            './main/organizacion/trabajadores-activos/trabajadores-activos.component'
          ).then((c) => c.TrabajadoresActivosComponent),
      },
      {
        path: 'organizacion/trabajadores-suspendidos',
        title: 'Trabajadores suspendidos | In Time',
        loadComponent: () =>
          import(
            './main/organizacion/trabajadores-inactivos/trabajadores-inactivos.component'
          ).then((c) => c.TrabajadoresInactivosComponent),
      },
      {
        path: 'organizacion/asignacion-edificios',
        title: 'Asignación de edificios | In Time',
        loadComponent: () =>
          import(
            './main/organizacion/asignacion-sede/asignacion-sede.component'
          ).then((c) => c.AsignacionSedeComponent),
      },

      /* Rutas de asistencia */
      {
        path: 'asistencia/vistas-asistencia',
        title: 'Vista de asistencia | In Time',
        loadComponent: () =>
          import(
            './main/asistencia/vistas-asistencia/vistas-asistencia.component'
          ).then((c) => c.VistasAsistenciaComponent),
      },
      {
        path: 'asistencia/permisos',
        title: 'Permisos | In Time',
        loadComponent: () =>
          import('./main/asistencia/permisos/permisos.component').then(
            (c) => c.PermisosComponent
          ),
      },
      {
        path: 'asistencia/inasistencia',
        title: 'Inasistencia | In Time',
        loadComponent: () =>
          import('./main/asistencia/inasistencia/inasistencia.component').then(
            (c) => c.InasistenciaComponent
          ),
      },
      {
        path: 'asistencia/reemplazos',
        title: 'Reemplazos | In Time',
        loadComponent: () =>
          import('./main/asistencia/reemplazos/reemplazos.component').then(
            (c) => c.ReemplazosComponent
          ),
      },
      {
        path: 'asistencia/vacaciones',
        title: 'Vacaciones | In Time',
        loadComponent: () =>
          import('./main/asistencia/vacaciones/vacaciones.component').then(
            (c) => c.VacacionesComponent
          ),
      },
      {
        path: 'asistencia/correccion-marcacion',
        title: 'Corrección de marcación | In Time',
        loadComponent: () =>
          import(
            './main/asistencia/correccion-marcacion/correccion-marcacion.component'
          ).then((c) => c.CorreccionMarcacionComponent),
      },
      {
        path: 'asistencia/visitas-supervisores',
        title: 'Visitas de supervisores | In Time',
        loadComponent: () =>
          import(
            './main/asistencia/visitas-supervisores/visitas-supervisores.component'
          ).then((c) => c.VisitasSupervisoresComponent),
      },

      /* Rutas de planilla */
      {
        path: 'planilla/vista-planilla',
        title: 'Vista de planilla | In Time',
        loadComponent: () =>
          import(
            './main/planilla/vista-planilla/vista-planilla.component'
          ).then((c) => c.VistaPlanillaComponent),
      },
      {
        path: 'planilla/adelantos',
        title: 'Adelantos | In Time',
        loadComponent: () =>
          import('./main/planilla/adelantos/adelantos.component').then(
            (c) => c.AdelantosComponent
          ),
      },
      {
        path: 'planilla/pago-descanseros',
        title: 'Pago descanseros | In Time',
        loadComponent: () =>
          import(
            './main/planilla/pago-descanseros/pago-descanseros.component'
          ).then((c) => c.PagoDescanserosComponent),
      },
      {
        path: 'planilla/pago-reemplazos',
        title: 'Pago reemplazos | In Time',
        loadComponent: () =>
          import(
            './main/planilla/pago-reemplazos/pago-reemplazos.component'
          ).then((c) => c.PagoReemplazosComponent),
      },
      {
        path: 'ajustes/parametros',
        title: 'Parametros | In Time',
        loadComponent: () =>
          import(
            './main/ajustes/configuracion/parametros/parametros.component'
          ).then((c) => c.ParametrosComponent),
      },
      {
        path: 'ajustes/usuarios',
        title: 'Usuarios | In Time',
        loadComponent: () =>
          import('./main/ajustes/usuarios/usuarios.component').then(
            (c) => c.UsuariosComponent
          ),
      },
      {
        path: 'ajustes/edificios',
        title: 'Edificios | In Time',
        loadComponent: () =>
          import('./main/ajustes/configuracion/sedes/sedes.component').then(
            (c) => c.SedesComponent
          ),
      },
      {
        path: 'ajustes/cargos',
        title: 'Cargos | In Time',
        loadComponent: () =>
          import('./main/ajustes/configuracion/cargos/cargos.component').then(
            (c) => c.CargosComponent
          ),
      },
      {
        path: 'ajustes/horarios',
        title: 'Horarios | In Time',
        loadComponent: () =>
          import(
            './main/ajustes/configuracion/horarios/horarios.component'
          ).then((c) => c.HorariosComponent),
      },
      {
        path: 'ajustes/dispositivos',
        title: 'Dispositivos | In Time',
        loadComponent: () =>
          import('./main/ajustes/dispositivos/dispositivos.component').then(
            (c) => c.DispositivosComponent
          ),
      },
      {
        path: 'ajustes/calendario',
        title: 'Calendario | In Time',
        loadComponent: () =>
          import('./main/ajustes/calendario/calendario.component').then(
            (c) => c.CalendarioComponent
          ),
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
