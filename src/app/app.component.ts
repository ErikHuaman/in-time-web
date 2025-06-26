import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '@stores/auth.store';
import { NacionalidadStore } from '@stores/nacionalidad.store';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ConfirmDialog, ToastModule],
  templateUrl: './app.component.html',
  styles: ``,
})
export class AppComponent {
  readonly store = inject(AuthStore);
  readonly nacStore = inject(NacionalidadStore);
  title = 'in Time';
  constructor() {
    this.store.checkSession();
    this.nacStore.getPaisByIso3('PER');
  }
}
