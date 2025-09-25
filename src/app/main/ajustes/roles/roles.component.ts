import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Column, ExportColumn } from '@models/column-table.model';
import { MessageGlobalService } from '@services/message-global.service';
import { RolStore } from '@stores/rol.store';
import { DialogService } from 'primeng/dynamicdialog';
import { FormRolesComponent } from './form-roles/form-roles.component';
import { Rol } from '@models/rol.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { TagStatusComponent } from '@components/tag-status/tag-status.component';
import { BtnAddComponent } from '@components/buttons/btn-add.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { FormPermisosComponent } from './form-permisos/form-permisos.component';
import { BtnCustomComponent } from '@components/buttons/btn-custom.component';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    SkeletonTableDirective,
    InputTextModule,
    FormsModule,
    TitleCardComponent,
    TagStatusComponent,
    BtnAddComponent,
    BtnCustomComponent,
    BtnEditComponent,
    BtnDeleteComponent,
    PaginatorDirective,
  ],
  templateUrl: './roles.component.html',
  styles: ``,
})
export class RolesComponent implements OnInit {
  title: string = 'Roles';

  icon: string = 'material-symbols:location-on-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(RolStore);

  cols!: Column[];

  exportColumns!: ExportColumn[];

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get dataTable(): Rol[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    this.loadingTable.set(this.store.loading());
    this.totalItems.set(this.store.totalItems());
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.error('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Rol eliminado exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'codigo', header: 'Código', align: 'center' },
      {
        field: 'isActive',
        header: 'Estado',
        align: 'center',
        widthClass: '!w-32',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!min-w-32',
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

  clear() {
    this.searchText.set('');
    this.limit.set(12);
    this.offset.set(0);
    this.loadData();
  }

  onPageChange = ({ limit, offset }: { limit: number; offset: number }) => {
    this.limit.set(limit);
    this.offset.set(offset);
    this.search();
  };

  permissions(item: Rol) {
    const ref = this.dialogService.open(FormPermisosComponent, {
      header: 'Asignar permisos',
      styleClass: 'modal-6xl',
      modal: true,
      data: { id: item.id! },
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.clear();
      }
    });
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormRolesComponent, {
      header: 'Nuevo rol',
      styleClass: 'modal-lg',
      modal: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.clear();
      }
    });
  }

  edit(item: Rol) {
    this.store.loadById(item.id!);
    this.openModal = true;
    const ref = this.dialogService.open(FormRolesComponent, {
      header: 'Editar rol',
      styleClass: 'modal-lg',
      modal: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.clear();
      }
    });
  }
  remove(item: Rol) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de eliminar el rol <span class='uppercase font-bold'>${item.nombre}</span>? </p>
          <p class='text-center'> Esta acción no se puede deshacer. </p>
        </div>`,
      () => {
        this.store.delete(item.id!);
      }
    );
  }
}
