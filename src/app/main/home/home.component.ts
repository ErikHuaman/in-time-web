import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { GrupoMenuItem } from '@models/grupo-modulo.model';
import { RolService } from '@services/rol.service';
import { AuthStore } from '@stores/auth.store';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ButtonModule, FieldsetModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent implements OnInit {
  readonly store = inject(AuthStore);

  readonly rolService = inject(RolService);

  listaMenu: GrupoMenuItem[] = [];

  get name() {
    return this.store.user()?.nombre;
  }

  get idRol() {
    return this.store.user()?.rol?.id;
  }

  ngOnInit() {
    this.cargarGrupoModulo();
  }

  cargarGrupoModulo() {
    if (this.idRol) {
      this.rolService.findAllModulesByIdRol(this.idRol).subscribe({
        next: (data) => {
          this.listaMenu = data.map((item) => ({
            label: item.nombre,
            menu: item.modulos.map((m) => ({
              label: m.nombre,
              icon: m.icono,
              routerLink: m.url,
            })),
          }));
        },
      });
    }
  }
}
