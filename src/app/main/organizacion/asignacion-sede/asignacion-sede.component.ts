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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FormAsignacionSedeComponent } from './form-asignacion-sede/form-asignacion-sede.component';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { Trabajador } from '@models/trabajador.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { TrabajadorStore } from '@stores/trabajador.store';
import { ButtonEditComponent } from '@components/buttons/button-edit.component';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { TagsSedesComponent } from '@components/tags-sedes/tags-sedes.component';

@Component({
  selector: 'app-asignacion-sede',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    TagsSedesComponent,
    SkeletonTableDirective,
    TitleCardComponent,
    ButtonEditComponent,
    PaginatorDirective,
  ],
  templateUrl: './asignacion-sede.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
          '¡Ups, ocurrió un error inesperado al eliminar la asignación de sede!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Asignación eliminada exitosamente!');
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
        customExportHeader: 'Doc ID',
        align: 'center',
        widthClass: '!w-20',
      },
      {
        field: 'labelName',
        header: 'Nombre completo',
        widthClass: '!min-w-72',
      },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'sede', header: 'Edificio', align: 'center' },
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

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.loadData();
  }

  loadData() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
      isAsigned: true,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  search() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
      isAsigned: true,
      search: this.searchText(),
      sedes: this.selectedSedes,
      cargos: this.selectedCargos,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  clear() {
    this.selectedCargos = [];
    this.selectedSedes = [];
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
    const ref = this.dialogService.open(FormAsignacionSedeComponent, {
      header: 'Asignación edificio',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.clear();
      }
    });
  }

  editar(idTrabajador: string) {
    this.store.clearSelected();
    const ref = this.dialogService.open(FormAsignacionSedeComponent, {
      header: 'Asignación edificio',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
      data: { idTrabajador },
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.clear();
      }
    });
  }
}
