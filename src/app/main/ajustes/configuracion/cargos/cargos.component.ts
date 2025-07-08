import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormCargoComponent } from './form-cargo/form-cargo.component';
import { Cargo } from '@models/cargo.model';
import { CargoService } from '@services/cargo.service';
import { Column, ExportColumn } from '@models/column-table.model';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageGlobalService } from '@services/message-global.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { CargoStore } from '@stores/cargo.store';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorComponent } from '@components/paginator/paginator.component';

@Component({
  selector: 'app-cargos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    PaginatorComponent
  ],
  templateUrl: './cargos.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CargosComponent implements OnInit {
  title: string = 'Cargos';

  icon: string = 'material-symbols:card-travel-outline-rounded';

  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(CargoStore);

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

  get dataTable(): Cargo[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
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
      // {
      //   field: 'isActive',
      //   header: 'Estado',
      //   align: 'center',
      //   widthClass: '!w-28',
      // },
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
    const ref = this.dialogService.open(FormCargoComponent, {
      header: 'Nuevo cargo',
      styleClass: 'modal-md',
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

  edit(item: Cargo) {
    this.store.loadById(item.id);
    this.openModal = true;
    const ref = this.dialogService.open(FormCargoComponent, {
      header: 'Editar cargo',
      styleClass: 'modal-md',
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

  // changeStatus(item: Cargo) {
  //   this.msg.confirm(
  //     `¿Está seguro de ${item.isActive ? 'desactivar' : 'activar'} el cargo ${
  //       item.nombre
  //     }?`,
  //     () => {
  //       this.cargoService.changeStatus(item.id, !item.isActive).subscribe({
  //         next: (data) => {
  //           this.cargarCargos();
  //         },
  //       });
  //     }
  //   );
  // }

  remove(item: Cargo) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el cargo <span class='uppercase font-bold'>${item.nombre}</span>? </p>
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
