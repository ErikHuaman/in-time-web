import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { MyPreset } from './core/constants/preset';
import { I18nPluralPipe, registerLocaleData } from '@angular/common';
import localeEsPE from '@angular/common/locales/es-PE';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageGlobalService } from './core/services/message-global.service';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DialogService } from 'primeng/dynamicdialog';
import { tokenInterceptor } from '@interceptors/token.interceptor';

registerLocaleData(localeEsPE);

const calendarProviders =
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory,
  }).providers ?? [];

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'PEN' },
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
      translation: {
        lt: 'es',
        dayNames: [
          'Domingo',
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
        ],
        dayNamesShort: [
          'Dom',
          'Lun',
          'Mar',
          'Mié',
          'Jue',
          'Vie',
          'Sáb',
        ],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        monthNames: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ],
        monthNamesShort: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        today: 'Hoy',
        clear: 'Limpiar',
        weekHeader: 'Sem',
        firstDayOfWeek: 1,
        dateFormat: 'dd M yy',
        accept: 'Aceptar',
        reject: 'Rechazar',
        selectionMessage: '{0} seleccionados'
      }
    }),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    DialogService,
    MessageService,
    ConfirmationService,
    MessageGlobalService,
    I18nPluralPipe,
    ...calendarProviders,
  ],
};
