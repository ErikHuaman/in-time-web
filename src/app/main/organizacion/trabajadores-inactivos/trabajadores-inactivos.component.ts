import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormInactivarTrabajadorComponent } from './form-inactivar-trabajador/form-inactivar-trabajador.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { MessageGlobalService } from '@services/message-global.service';
import { Trabajador } from '@models/trabajador.model';
import { TrabajadorInactivoStore } from '@stores/trabajador-inactivo.store';
import { BtnAddComponent } from '@components/buttons/btn-add.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { TagsSedesComponent } from '@components/tags-sedes/tags-sedes.component';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';

@Component({
  selector: 'app-trabajadores-inactivos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    SkeletonTableDirective,
    TagsSedesComponent,
    InputTextModule,
    SelectModule,
    FormsModule,
    TitleCardComponent,
    BtnAddComponent,
    BtnEditComponent,
    PaginatorDirective,
  ],
  templateUrl: './trabajadores-inactivos.component.html',
  styles: ``,
})
export class TrabajadoresInactivosComponent implements OnInit {
  title: string = 'Trabajadores suspendidos';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(TrabajadorInactivoStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  cols!: Column[];

  exportColumns!: ExportColumn[];

  get dataTable(): Trabajador[] {
    return this.store.items().map((item) => {
      item.labelName = `${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get listaCargos(): Cargo[] {
    return this.cargoStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  private resetOnSuccessEffect = effect(() => {
    this.loadingTable.set(this.store.loading());
    this.totalItems.set(this.store.totalItems());
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.error('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al eliminar el trabajador inactivo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Trabajador activado exitosamente!');
      this.store.clearSelected();
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
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'sedes', header: 'Edificios', align: 'center' },
      {
        field: 'motivoSuspension',
        header: 'Motivo de suspención',
        align: 'center',
      },
      {
        field: 'nota',
        header: 'Nota',
        align: 'center',
      },
      {
        field: 'fechaInicio',
        header: 'Inicio de la suspención',
        align: 'center',
      },
      { field: 'fechaFin', header: 'Fin de la suspención', align: 'center' },
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
    const q: Record<string, any> = {
      filter: false,
      isActive: false,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  search() {
    const q: Record<string, any> = {
      filter: false,
      isActive: false,
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

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    const ref = this.dialogService.open(FormInactivarTrabajadorComponent, {
      header: 'Nueva suspensión',
      styleClass: 'modal-md',
      position: 'center',
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

  edit(id: string) {
    const ref = this.dialogService.open(FormInactivarTrabajadorComponent, {
      header: 'Modificar suspensión',
      styleClass: 'modal-md',
      position: 'center',
      data: { id },
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

  // reactivate(item: Trabajador) {
  //   this.msg.confirm(
  //     `<div class='px-4 py-2'>
  //       <p class='text-center'> ¿Está seguro de reactivar al trabajador <span class='uppercase font-bold'>${item.nombre} ${item.apellido}</span>? </p>
  //     </div>`,
  //     () => {
  //       this.store.changeStatus(item.id!, true);
  //     }
  //   );
  // }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
