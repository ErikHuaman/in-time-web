import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormAdelantoComponent } from './form-adelanto/form-adelanto.component';
import { DatePickerModule } from 'primeng/datepicker';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { Adelanto } from '@models/adelanto.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { AdelantoStore } from '@stores/adelanto.store';
import { MessageGlobalService } from '@services/message-global.service';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';

@Component({
  selector: 'app-adelantos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    SkeletonTableDirective,
    TitleCardComponent,
    BtnEditComponent,
    BtnDeleteComponent,
  ],
  templateUrl: './adelantos.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdelantosComponent implements OnInit {
  title: string = 'Adelantos de sueldo';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly store = inject(AdelantoStore);

  fechaSelected: Date | undefined = new Date();

  openModal: boolean = false;

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

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

  get listaAdelantos(): Adelanto[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
    this.loadingTable.set(this.store.loading());
    this.totalItems.set(this.store.totalItems());
    const error = this.store.error();
    const action = this.store.lastAction();
    const items = this.store.items();

    if (items) {
      this.filtrar();
    }

    // Manejo de errores
    if (!this.openModal && error) {
      console.error('error', error);
      this.msg.error(
        error ??
          '¡Ups, ocurrió un error inesperado al eliminar el adelanto de sueldo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Adelanto de sueldo eliminado exitosamente!');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  dataTable: Adelanto[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'PermisoTrabajador ID',
        align: 'center',
        widthClass: '!w-20',
      },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'sede', header: 'Sede', align: 'center' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'montoAdelanto', header: 'Monto adelantado', align: 'center' },
      {
        field: 'cuotasDescuento',
        header: 'Cuotas de descuento',
        align: 'center',
      },
      { field: 'fechaAdelanto', header: 'Fecha de adelanto', align: 'center' },
      {
        field: 'fechaDescuento',
        header: 'Fecha de descuento',
        align: 'center',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!min-w-32',
      },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
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

  filtrar(event?: number) {
    this.dataTable = this.listaAdelantos.filter(
      (t) =>
        this.selectedSedes.includes(t.idSede as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    );
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormAdelantoComponent, {
      header: 'Registrar adelanto de sueldo',
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

  edit(item: any) {
    this.store.loadById(item.id!);
    this.openModal = true;
    const ref = this.dialogService.open(FormAdelantoComponent, {
      header: 'Inactivar trabajador',
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

  remove(item: Adelanto) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el adelanto a <span class='uppercase font-bold'>${item?.trabajador?.nombre} ${item?.trabajador?.apellido}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id!);
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
