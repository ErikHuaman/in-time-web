import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FormVacacionesComponent } from './form-vacaciones/form-vacaciones.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { TrabajadorService } from '@services/trabajador.service';
import { VacacionService } from '@services/vacacion.service';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { Vacacion } from '@models/vacacion.model';
import { Trabajador } from '@models/trabajador.model';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { MessageGlobalService } from '@services/message-global.service';

@Component({
  selector: 'app-vacaciones',
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
    TagModule,
    DatePickerModule,
    TooltipModule,
    SkeletonModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './vacaciones.component.html',
  styles: ``,
  providers: [DialogService],
})
export class VacacionesComponent implements OnInit {
  title: string = 'Vacaciones programadas';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly vacacionService = inject(VacacionService);

  fechaSelected: Date | undefined = new Date('2025/03/01');

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  listaTrabajadores: Trabajador[] = [];

  listaVacaciones: Vacacion[] = [];

  dataTable: Vacacion[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

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

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'Vacación ID',
        align: 'center',
        widthClass: '!w-20',
      },
      { field: 'sede', header: 'Sede', align: 'center' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'diasUtilizados', header: 'Días utilizados', align: 'center' },
      { field: 'diasDisponibles', header: 'Días disponibles', align: 'center' },
      { field: 'fechaInicio', header: 'Fecha inicio', align: 'center' },
      { field: 'fechaFin', header: 'Fecha fin', align: 'center' },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!w-36',
      },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.cargarVacaciones();
  }

  cargarVacaciones() {
    this.loadingTable = true;
    this.vacacionService.findAll().subscribe({
      next: (data) => {
        this.listaVacaciones = data;
        this.loadingTable = false;
        this.filtrar();
      },
    });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaVacaciones.filter(
      (t) =>
        this.selectedSedes.includes(t.idSede as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    );
  }

  addNew() {
    const ref = this.dialogService.open(FormVacacionesComponent, {
      header: 'Establecer vacaciones',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarVacaciones();
      }
    });
  }

  edit(item: any) {
    const ref = this.dialogService.open(FormVacacionesComponent, {
      header: 'Detalle de vacaciones',
      styleClass: 'modal-md',
      position: 'center',
      data: item,
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarVacaciones();
      }
    });
  }

  remove(item: Vacacion) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
            <p class='text-center'> ¿Está seguro de eliminar el usuario <span class='uppercase font-bold'>${item.trabajador?.nombre}</span>? </p>
            <p class='text-center'> Esta acción no se puede deshacer. </p>
          </div>`,
      () => {
        // this.store.delete(item.id);
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
