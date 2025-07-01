import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Column, ExportColumn } from '@models/column-table.model';
import { Usuario } from '@models/usuario.model';
import { MessageGlobalService } from '@services/message-global.service';
import { UsuarioService } from '@services/usuario.service';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormUsuarioComponent } from './form-usuario/form-usuario.component';
import { FormRolesComponent } from './form-roles/form-roles.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { UsuarioStore } from '@stores/usuario.store';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    ChipModule,
    PopoverModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './usuarios.component.html',
  styles: ``,
  providers: [DialogService],
})
export class UsuariosComponent implements OnInit {
  title: string = 'Usuarios';

  icon: string = 'ic:round-people-alt';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(UsuarioStore);

  cols!: Column[];

  exportColumns!: ExportColumn[];

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  searchText = signal('');

  get loadingTable(): boolean {
    return this.store.loading();
  }

  get totalItems(): number {
    return this.store.totalItems();
  }

  get dataTable(): Usuario[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el usuario!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Usuario eliminado exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      // {
      //   field: 'id',
      //   header: 'ID',
      //   customExportHeader: 'Cargo ID',
      //   align: 'center',
      //   widthClass: '!w-32',
      // },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'usuario', header: 'Usuario', align: 'center' },
      { field: 'rol', header: 'Rol', align: 'center' },
      { field: 'sedes', header: 'Edificios', align: 'center' },
      {
        field: 'isActive',
        header: 'Estado',
        align: 'center',
        widthClass: '!w-28',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!w-36',
      },
    ];

    this.exportColumns = this.cols
      .filter((col) => col.field != '')
      .map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));

    this.loadData();
  }

  loadData() {
    this.store.loadAll(this.limit(), this.offset());
  }

  search() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
      search: this.searchText(),
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormUsuarioComponent, {
      header: 'Nuevo usuario',
      styleClass: 'modal-2xl',
      modal: true,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(item: Usuario) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormUsuarioComponent, {
      header: 'Editar usuario',
      styleClass: 'modal-2xl',
      modal: true,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  permisos() {
    const ref = this.dialogService.open(FormRolesComponent, {
      header: 'Roles de usuario',
      styleClass: 'modal-2xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  // changeStatus(item: Usuario) {
  //   this.msg.confirm(
  //     `¿Está seguro de ${item.isActive ? 'desactivar' : 'activar'} el usuario ${
  //       item.nombre
  //     }?`,
  //     () => {
  //       this.store.changeStatus(item.id, !item.isActive);
  //     }
  //   );
  // }

  remove(item: Usuario) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de eliminar el usuario <span class='uppercase font-bold'>${item.nombre}</span>? </p>
          <p class='text-center'> Esta acción no se puede deshacer. </p>
        </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
