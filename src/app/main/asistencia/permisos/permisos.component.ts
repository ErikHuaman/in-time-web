import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormPermisoComponent } from './form-permiso/form-permiso.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { TrabajadorService } from '@services/trabajador.service';
import { mergeMap } from 'rxjs';
import { Column, ExportColumn } from '@models/column-table.model';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';
import { PermisoTrabajadorService } from '@services/permiso-trabajador.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonEditComponent } from '@components/buttons/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete.component';
import { MessageGlobalService } from '@services/message-global.service';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { PermisoTrabajadorStore } from '@stores/permiso-trabajador.store';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-permisos',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DatePickerModule,
    TooltipModule,
    MultiSelectModule,
    SkeletonModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './permisos.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PermisosComponent implements OnInit {
  title: string = 'Permisos';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly store = inject(PermisoTrabajadorStore);

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

  get listaPermisos(): PermisoTrabajador[] {
    return this.store.items();
  }

  private resetOnSuccessEffect = effect(() => {
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
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el permiso!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Permiso eliminado exitosamente!');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  dataTable: PermisoTrabajador[] = [];

  limit = signal(12);
  offset = signal(0);
  searchText = signal('');

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  ngOnInit(): void {
    this.cols = [
      { field: 'sede', header: 'Sede', align: 'center' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'nota', header: 'Nota', align: 'center' },
      { field: 'fechaInicio', header: 'Fecha inicio', align: 'center' },
      { field: 'fechaFin', header: 'Fecha fin', align: 'center' },
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
    this.dataTable = this.listaPermisos.filter(
      (t) =>
        this.selectedSedes.includes(t.idSede as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    );
  }

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormPermisoComponent, {
      header: 'Nuevo permiso',
      styleClass: 'modal-md',
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

  edit(item: PermisoTrabajador) {
    this.store.loadById(item.id!);
    this.openModal = true;
    const ref = this.dialogService.open(FormPermisoComponent, {
      header: 'Modificar permiso',
      styleClass: 'modal-md',
      position: 'center',
      data: item,
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

  remove(item: PermisoTrabajador) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
          <p class='text-center'> ¿Está seguro de eliminar el permiso de <span class='uppercase font-bold'>${item?.trabajador?.nombre} ${item?.trabajador?.apellido}</span>? </p>
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
