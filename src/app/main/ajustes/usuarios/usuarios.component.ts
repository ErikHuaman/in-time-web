import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Column, ExportColumn } from '@models/column-table.model';
import { Usuario } from '@models/usuario.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormUsuarioComponent } from './form-usuario/form-usuario.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { UsuarioStore } from '@stores/usuario.store';
import { TagStatusComponent } from '@components/tag-status/tag-status.component';
import { TagsSedesComponent } from '@components/tags-sedes/tags-sedes.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { BtnAddComponent } from '@components/buttons/btn-add.component';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { PaginatorDirective } from '@components/paginator/paginator.directive';

@Component({
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    SkeletonTableDirective,
    InputTextModule,
    TagsSedesComponent,
    TagStatusComponent,
    TitleCardComponent,
    BtnAddComponent,
    BtnEditComponent,
    BtnDeleteComponent,
    PaginatorDirective,
  ],
  templateUrl: './usuarios.component.html',
  styles: ``,
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
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get dataTable(): Usuario[] {
    return this.store.items().map((item) => {
      item.labelName = `${item.nombre} ${item.apellido}`;
      return item;
    });
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
      {
        field: 'identificacion',
        header: 'Doc ID',
        align: 'center',
        widthClass: '!min-w-32',
      },
      {
        field: 'labelName',
        header: 'Nombre completo',
        widthClass: '!min-w-72',
      },
      { field: 'usuario', header: 'Usuario', align: 'center' },
      { field: 'rol', header: 'Rol', align: 'center' },
      {
        field: 'sedes',
        header: 'Edificios',
        align: 'center',
        widthClass: '!max-w-100',
      },
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
        this.clear();
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
        this.clear();
      }
    });
  }

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
}
