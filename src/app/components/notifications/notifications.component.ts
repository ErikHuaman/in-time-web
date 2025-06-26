import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AlertaService } from '@services/alerta.service';
import { WebSocketService } from '@services/web-socket.service';
import { AuthStore } from '@stores/auth.store';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    ButtonModule,
    PopoverModule,
    BadgeModule,
    TooltipModule,
  ],
  templateUrl: './notifications.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notificaciones: any[] = [];
  private sub!: Subscription;

  readonly store = inject(AuthStore);

  readonly ws = inject(WebSocketService);

  readonly alertaService = inject(AlertaService);

  get userId() {
    return this.store.user()?.id;
  }

  pendientes: number = 0;

  ngOnInit() {
    this.cargarNotificaciones();
    this.conectarWS();
  }

  cargarNotificaciones() {
    if (this.userId) {
      this.alertaService.findAll().subscribe((data: any) => {
        this.notificaciones = data;
        this.pendientes = data.filter((d: any) => !d.leido).length;
      });
    }
  }

  conectarWS() {
    if (this.userId) {
      this.sub = this.ws.listenToUserAlerts(this.userId).subscribe((data) => {
        console.log('Alerta recibida:', data);
        this.cargarNotificaciones();
      });
    }
  }

  changeLeido(id: string) {
    this.alertaService.changeLeido(id).subscribe((data) => {
      this.cargarNotificaciones();
    });
  }

  eliminar(id: string) {
    this.alertaService.delete(id).subscribe((data) => {
      this.cargarNotificaciones();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
