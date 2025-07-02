import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-configuracion',
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './configuracion.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConfiguracionComponent {
  title: string = 'Configuración';

  icon: string = 'material-symbols:settings-suggest-outline';

  listaOpciones = [
    {
      title: 'Edificios',
      icon: "uil:building",
      description: 'Configure sus ubicaciones y sucursales.',
      routerLink: '/ajustes/configuracion/sedes',
    },
    {
      title: 'Cargos',
      icon: 'uil:bag-alt',
      description: 'Configure los cargos de sus trabajadores.',
      routerLink: '/ajustes/configuracion/cargos',
    },
    {
      title: 'Horarios',
      icon: 'material-symbols:calendar-clock-outline',
      description: 'Configure los patrones de horarios de su empresa.',
      routerLink: '/ajustes/configuracion/horarios',
    },
    // {
    //   title: 'Calendario',
    //   icon: 'material-symbols:calendar-month-outline-rounded',
    //   description: 'Configure las fechas y eventos.',
    //   routerLink: '/ajustes/configuracion/calendario',
    // },
    // {
    //   title: 'Alertas',
    //   description: 'Configure las notificaciones y alerta.',
    //   routerLink: '/ajustes/configuracion/alertas',
    // },
    // {
    //   title: 'Patrones de marcación',
    //   description: 'Configure los patrones de marcación de asistencia.',
    //   routerLink: '/ajustes/configuracion/patrones-horario',
    // },
    {
      title: 'Parametros generales',
      icon: 'uil:money-stack',
      description: 'Configure los parametros de de la empresa.',
      routerLink: '/ajustes/configuracion/parametros',
    },
  ];
}
