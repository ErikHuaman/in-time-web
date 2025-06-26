import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FormHorarioComponent } from './form-horario/form-horario.component';
import { RouterModule } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { forkJoin, map, mergeMap } from 'rxjs';
import { Column, ExportColumn } from '@models/column-table.model';
import { TooltipModule } from 'primeng/tooltip';
import { HorarioTrabajador } from '@models/horario-trabajador.model';
import { Cargo } from '@models/cargo.model';
import { HorarioTrabajadorService } from '@services/horario-trabajador.service';
import { SkeletonModule } from 'primeng/skeleton';
import { HorarioTrabajadorItem } from '@models/horario-trabajador-item.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { Sede } from '@models/sede.model';

@Component({
  selector: 'app-horario',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    SkeletonModule,
    TabsModule,
    TitleCardComponent,
  ],
  templateUrl: './horarios.component.html',
  styles: ``,
  providers: [DialogService],
})
export class HorariosComponent {
  title: string = 'Horarios';

  icon: string = 'material-symbols:calendar-clock-outline';

  private readonly dialogService = inject(DialogService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly horarioTrabajadorService = inject(HorarioTrabajadorService);

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  searchText = signal('');

  // get loadingTable(): boolean {
  //   return this.store.loading();
  // }

  // get totalItems(): number {
  //   return this.store.totalItems();
  // }

  // dataTable: Trabajador[] = [];

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

  // private resetOnSuccessEffect = effect(() => {
  //   const error = this.store.error();
  //   const action = this.store.lastAction();
  //   const items = this.store.items();

  //   if (items) {
  //     this.filtrar();
  //   }

  //   // Manejo de errores
  //   if (!this.openModal && error) {
  //     console.log('error', error);
  //     this.msg.error(
  //       error ?? '¡Ups, ocurrió un error inesperado al eliminar el equipo!'
  //     );
  //     return; // Salimos si hay un error
  //   }

  //   // Si se ha creado o actualizado correctamente
  //   if (action === 'deleted') {
  //     this.msg.success('¡equipo eliminado exitosamente!');
  //     this.store.clearSelected();
  //     this.loadData();
  //     return;
  //   }
  // });

  cols!: Column[];

  loadingTable?: boolean = false;

  exportColumns!: ExportColumn[];

  fechaSelected: Date = new Date('2025/03/01');

  listaHorarioTrabajadores: HorarioTrabajador[] = [];

  dataTable: HorarioTrabajador[] = [];
  dataTableDescansero: HorarioTrabajador[] = [];

  ngOnInit(): void {
    this.cols = [
      // {
      //   field: 'id',
      //   header: 'ID',
      //   customExportHeader: 'Cargo ID',
      //   align: 'center',
      // },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'lunes', header: 'Lunes', align: 'center', widthClass: '!w-42' },
      {
        field: 'martes',
        header: 'Martes',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'miercoles',
        header: 'Miércoles',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'jueves',
        header: 'Jueves',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'viernes',
        header: 'Viernes',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'sabado',
        header: 'Sábado',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'domingo',
        header: 'Domingo',
        align: 'center',
        widthClass: '!w-42',
      },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();

    this.cargarHorarioTrabajadores();
  }

  cargarHorarioTrabajadores() {
    this.loadingTable = true;
    this.horarioTrabajadorService.findAll().subscribe({
      next: (data) => {
        this.listaHorarioTrabajadores = data;
        this.loadingTable = false;
        this.filtrar();
      },
    });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaHorarioTrabajadores
      .filter((item) => item.trabajador?.contratos[0].cargo.isEditable)
      .filter(
        (t) =>
          this.selectedSedes.some((s) =>
            t.trabajador?.sedes.filter((as) => as.id == s)
          ) &&
          this.selectedCargos.includes(
            t.trabajador?.contratos[0]?.idCargo as string
          )
      );
    this.dataTableDescansero = this.listaHorarioTrabajadores
      .filter((item) => !item.trabajador?.contratos[0].cargo.isEditable)
      .filter((t) =>
        this.selectedSedes.some((s) =>
          t.trabajador?.sedes.filter((as) => as.id == s)
        )
      );
  }

  getDias(items: HorarioTrabajadorItem[]): number[] {
    return [...new Set(items.map((item: HorarioTrabajadorItem) => item.numDia))]
      .filter((item): item is number => Number.isInteger(item))
      .sort((a, b) => a - b);
  }

  getTurnos(items: HorarioTrabajadorItem[]): number[] {
    return [
      ...new Set(items.map((item: HorarioTrabajadorItem) => item.numTurno)),
    ]
      .filter((item): item is number => Number.isInteger(item))
      .sort((a, b) => a - b);
  }

  getHorario(items: HorarioTrabajadorItem[], dia: number, turno: number) {
    return items.find((h) => h.numDia === dia && h.numTurno === turno);
  }

  addNew() {
    const ref = this.dialogService.open(FormHorarioComponent, {
      header: 'Nuevo horario',
      styleClass: 'modal-6xl',
      data: { isEditable: true },
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarHorarioTrabajadores();
      }
    });
  }

  addNewDescansero() {
    const ref = this.dialogService.open(FormHorarioComponent, {
      header: 'Nuevo horario para descansero',
      styleClass: 'modal-6xl',
      data: { isEditable: false },
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarHorarioTrabajadores();
      }
    });
  }

  edit(item: any) {
    // this.dialogService.open(FormNewHeadquarterComponent, {
    //   header: "Editar sede",
    // styleClass: "modal-6xl",
    // position: "top",
    // modal: true,
    // dismissableMask: true,
    // closable: true
    // })
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
