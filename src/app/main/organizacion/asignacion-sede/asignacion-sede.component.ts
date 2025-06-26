import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FormAsignacionSedeComponent } from './form-asignacion-sede/form-asignacion-sede.component';
import { CargoService } from '@services/cargo.service';
import { SedeService } from '@services/sede.service';
import { TrabajadorService } from '@services/trabajador.service';
import { Cargo } from '@models/cargo.model';
import { forkJoin, mergeMap } from 'rxjs';
import { Sede } from '@models/sede.model';
import { Trabajador } from '@models/trabajador.model';
import { SkeletonModule } from 'primeng/skeleton';
import { Column, ExportColumn } from '@models/column-table.model';
import { TagModule } from 'primeng/tag';
import { MessageGlobalService } from '@services/message-global.service';
import { AsignacionSedeService } from '@services/asignacion-sede.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { TrabajadorStore } from '@stores/trabajador.store';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { PaginatorComponent } from '@components/paginator/paginator.component';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-asignacion-sede',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    ChipModule,
    PopoverModule,
    TitleCardComponent,
    ButtonEditComponent,
    PaginatorComponent,
  ],
  templateUrl: './asignacion-sede.component.html',
  styles: ``,
  providers: [DialogService],
})
export class AsignacionSedeComponent implements OnInit {
  title: string = 'Asignación de edificio';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly store = inject(TrabajadorStore);

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  get listaTrabajadores(): Trabajador[] {
    return this.store.items();
  }

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

  dataTable: Trabajador[] = [];

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore.items();
  }

  private sedesEffect = effect(() => {
    const sedes = this.sedeStore.items();
    if (sedes) {
      this.selectedSedes = sedes.map((item) => item.id);
      this.filtrar();
    }
  });

  private cargosEffect = effect(() => {
    const cargos = this.cargoStore.items();
    if (cargos) {
      this.selectedCargos = cargos.map((item) => item.id);
      this.filtrar();
    }
  });

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();
    const items = this.store.items();

    if (items) {
      this.filtrar();
    }

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el equipo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡equipo eliminado exitosamente!');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  cols!: Column[];

  exportColumns!: ExportColumn[];

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'Asignación ID',
        align: 'center',
        widthClass: '!w-20',
      },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'sede', header: 'Edificio', align: 'center' },
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

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.loadData();
  }

  loadData() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
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

  filtrar(event?: any) {
    this.dataTable = this.listaTrabajadores.filter(
      (t) =>
        this.selectedSedes.includes(t.sedes[0]?.id!) &&
        this.selectedCargos.includes(t.contratos[0]?.idCargo!)
    );
  }

  addNew() {
    const ref = this.dialogService.open(FormAsignacionSedeComponent, {
      header: 'Asignación edificio',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  editar(idTrabajador: string) {
    const ref = this.dialogService.open(FormAsignacionSedeComponent, {
      header: 'Asignación edificio',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: true,
      closable: true,
      data: { idTrabajador },
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }

  // calculateitemTotal(idSede: string) {
  //   let total = 0;

  //   if (this.dataTable) {
  //     for (let trabajador of this.dataTable) {
  //       if (trabajador.sede?.id === idSede) {
  //         total++;
  //       }
  //     }
  //   }

  //   return total;
  // }
}
