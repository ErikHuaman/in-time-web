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
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageGlobalService } from '@services/message-global.service';
import { TooltipModule } from 'primeng/tooltip';
import { SedeStore } from '@stores/sede.store';
import { PaginatorComponent } from '@components/paginator/paginator.component';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-sedes',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    FormsModule,
    TagModule,
    SkeletonModule,
    InputGroup,
    InputGroupAddonModule,
    TooltipModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    PaginatorComponent,
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
  searchText = signal('');

  get loadingTable(): boolean {
    return this.store.loading();
  }

  get totalItems(): number {
    return this.store.totalItems();
  }

  get dataTable(): Sede[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
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
    const ref = this.dialogService.open(FormSedesComponent, {
      header: 'Nuevo edificio',
      styleClass: 'modal-6xl',
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
        this.loadData();
      }
    });
  }

  // changeStatus(item: Sede) {
  //   this.msg.confirm(
  //     `¿Está seguro de ${
  //       item.isActive ? 'desactivar' : 'activar'
  //     } el edificio ${item.nombre}?`,
  //     () => {
  //       // this.sedeService.changeStatus(item.id, !item.isActive).subscribe({
  //       //   next: (data) => {
  //       //     this.cargarSedes();
  //       //   },
  //       // });
  //     }
  //   );
  // }

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

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
