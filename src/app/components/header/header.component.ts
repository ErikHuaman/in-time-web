import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '@stores/auth.store';
import { RolService } from '@services/rol.service';
import { NotificationsComponent } from '../notifications/notifications.component';
import { GrupoMenuItem } from '@models/grupo-modulo.model';
import { Dialog } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SplitButtonModule,
    AvatarModule,
    MenuModule,
    Dialog,
    DrawerModule,
    AccordionModule,
    NotificationsComponent,
  ],
  templateUrl: './header.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class HeaderComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  readonly store = inject(AuthStore);

  readonly rolService = inject(RolService);

  readonly router = inject(Router);

  mobileMenuVisible: boolean = false;

  listaMenu: GrupoMenuItem[] = [];
  menuItems: MenuItem[] = [];
  profileMenuItems: MenuItem[] = [
    // {
    //   label: 'Perfil',
    //   icon: 'material-symbols:person-edit-outline-rounded',
    //   command: () => {
    //     console.log('Perfil');
    //   },
    // },
    // {
    //   label: 'Configuración',
    //   icon: 'material-symbols:settings-outline-rounded',
    //   command: () => {
    //     console.log('Configuración');
    //   },
    // },
    {
      label: 'Descargar Apps',
      icon: 'icomoon-free:mobile',
      command: () => {
        this.showDownload = true;
      },
    },
    {
      label: 'Cerrar sesión',
      icon: 'material-symbols:logout',
      command: () => {
        this.store.logout();
      },
    },
  ];

  listApks = [
    {
      label: 'App administración',
      icon: 'eos-icons:admin-outlined',
      routerLink: '/apks/inTimeAdmin.apk',
    },
    {
      label: 'App marcación de asistencia',
      icon: 'hugeicons:face-id',
      routerLink: '/apks/inTimeTick.apk',
    },
  ];

  showDownload: boolean = false;

  get profileImage() {
    return null;
  }

  get username() {
    return this.store.user()?.username;
  }

  get name() {
    return this.store.user()?.nombre;
  }

  get rolNombre() {
    return this.store.user()?.rol?.nombre;
  }

  get idRol() {
    return this.store.user()?.rol?.id;
  }

  get fullName() {
    return `${this.store.user()?.nombre} ${this.store.user()?.apellido}`;
  }

  get initials() {
    return this.store.user()?.nombre.charAt(0);
  }

  ngOnInit() {
    this.cargarGrupoModulo();
  }

  toggleMenu(event: MouseEvent, menu: MenuItem[]) {
    this.menuItems = menu;
    this.menu.toggle(event);
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
  accordionIndex: number = 0; // ningún panel abierto

  showDrawer() {
    this.mobileMenuVisible = true;
    this.accordionIndex = 0;
  }

  trackByLabel(index: number, item: any): string {
    return item.label;
  }

  routerMobile(url: string) {
    this.router.navigate([url]);
    this.mobileMenuVisible = false;
  }
}
