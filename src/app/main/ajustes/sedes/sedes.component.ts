import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormSedesComponent } from './form-sedes/form-sedes.component';
import { Column, ExportColumn } from '@models/column-table.model';
import { RouterModule } from '@angular/router';
import { Sede } from '@models/sede.model';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageGlobalService } from '@services/message-global.service';
import { TooltipModule } from 'primeng/tooltip';
import { SedeStore } from '@stores/sede.store';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { BtnAddComponent } from '@components/buttons/btn-add.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { TagStatusComponent } from '@components/tag-status/tag-status.component';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { FormDaysWorkedComponent } from './form-days-worked/form-days-worked.component';

@Component({
  selector: 'app-sedes',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    SkeletonTableDirective,
    InputTextModule,
    FormsModule,
    TooltipModule,
    TitleCardComponent,
    TagStatusComponent,
    BtnAddComponent,
    BtnEditComponent,
    BtnDeleteComponent,
    ButtonCustomComponent,
    PaginatorDirective,
  ],
  templateUrl: './sedes.component.html',
  styles: ``,
})
export class SedesComponent implements OnInit {
  title: string = 'Edificios';

  icon: string = 'material-symbols:location-on-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(SedeStore);

  cols!: Column[];

  exportColumns!: ExportColumn[];

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get dataTable(): Sede[] {
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
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el edificio!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡Edificio eliminado exitosamente!');
      this.store.clearAll();
      this.loadData();
      return;
    }
  });

  ngOnInit() {
    this.cols = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'direccion', header: 'Dirección' },
      { field: 'ruc', header: 'RUC' },
      { field: 'razonSocial', header: 'Razón social' },
      {
        field: 'latitud',
        header: 'Latitud',
        align: 'center',
        widthClass: '!w-34',
      },
      {
        field: 'longitud',
        header: 'Longitud',
        align: 'center',
        widthClass: '!w-34',
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
    const ref = this.dialogService.open(FormSedesComponent, {
      header: 'Nuevo edificio',
      styleClass: 'modal-6xl',
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

  edit(item: Sede) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormSedesComponent, {
      header: 'Editar edificio',
      styleClass: 'modal-6xl',
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

  remove(item: Sede) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el edificio <span class='uppercase font-bold'>${item.nombre}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id);
      }
    );
  }

  setDiasTrab(item: Sede) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormDaysWorkedComponent, {
      header: `Días laborados | ${item.nombre}`,
      styleClass: 'modal-xl',
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
}
