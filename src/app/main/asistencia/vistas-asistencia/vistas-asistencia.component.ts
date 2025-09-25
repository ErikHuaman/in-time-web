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
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { MultiSelectModule } from 'primeng/multiselect';
import { AsistenciaService } from '@services/asistencia.service';
import { getDiasDelMes } from '@functions/fecha.function';
import { Cargo } from '@models/cargo.model';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { DetalleAsistenciaComponent } from './detalle-asistencia/detalle-asistencia.component';
import { EstadoAsistenciaService } from '@services/estado-asistencia.service';
import { EstadoAsistencia } from '@models/estado-asistencia.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { Column } from '@models/column-table.model';
import { TagsSedesComponent } from '@components/tags-sedes/tags-sedes.component';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { AsistenciaStore } from '@stores/asistencia.store';
import { FeriadoService } from '@services/feriado.service';
import { Feriado } from '@models/feriado.model';

@Component({
  selector: 'app-vistas-asistencia',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    FormsModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    SelectButtonModule,
    TagsSedesComponent,
    DatePickerModule,
    PopoverModule,
    SkeletonTableDirective,
    MultiSelectModule,
    TitleCardComponent,
    ButtonCustomComponent,
    PaginatorDirective,
  ],
  templateUrl: './vistas-asistencia.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VistasAsistenciaComponent implements OnInit {
  title: string = 'Vistas de asistencia';

  icon: string = 'material-symbols:calendar-month-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly store = inject(AsistenciaStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly asistenciaService = inject(AsistenciaService);

  private readonly estadoAsistenciaService = inject(EstadoAsistenciaService);

  private readonly feriadoService = inject(FeriadoService);

  fechaSelected!: Date;

  fechaSelectedPrev!: Date;

  firstCols!: Column[];
  lastCols!: Column[];

  daysMonth: any[] = [];

  iconsMarcacion = [
    {
      label: 'Entrada',
      icon: 'tabler:circle-number-1',
    },
    {
      label: 'Salida',
      icon: 'tabler:circle-number-6',
    },
  ];

  tabSelected: 'general' | 'worker' = 'general';

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  dataTableWorker: any[] = [];

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  get listaCargos(): Cargo[] {
    return this.cargoStore
      .items()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  listaTrabajadores: Trabajador[] = [];

  listaAsistenciaMensual: any[] = [];

  cards: any[] = [];

  leyenda: EstadoAsistencia[] = [];

  dataTable: any[] = [];
  dataAsistencia: any[] = [];
  itemSelected: any;

  private resetOnSuccessEffect = effect(() => {
    this.loadingTable.set(this.store.loading());
    this.totalItems.set(this.store.totalItems());
  });

  ngOnInit(): void {
    this.fechaSelected = new Date();

    this.firstCols = [
      {
        field: 'acciones',
        header: '',
        align: 'center',
        widthClass: '!w-16',
      },
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
      {
        field: 'sedes',
        header: 'Edificios',
        align: 'center',
        widthClass: '!max-w-100',
      },
    ];

    this.lastCols = [
      {
        field: 'diasLaborados',
        header: 'Días lab.',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'feriados',
        header: 'Feriados',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'faltas',
        header: 'F',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'permisos',
        header: 'P',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'descansos',
        header: 'X',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'totalDias',
        header: 'Total',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'horasDiarias',
        header: 'Horas diarias',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'horasSemanales',
        header: 'Horas sem.',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'horasMensuales',
        header: 'Horas mes',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'horasOrdinarias',
        header: 'Horas ord.',
        align: 'center',
        widthClass: '!w-16',
      },
      {
        field: 'horasExtra',
        header: 'Horas extra',
        align: 'center',
        widthClass: '!w-16',
      },
    ];

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.cargarDias();
    this.cargarLeyenda();
    this.cargarAsistencia();
  }

  get cols(): Column[] {
    return [
      ...this.firstCols,
      ...(this.dataTable.length !== 0
        ? this.daysMonth
        : [{ field: '', header: '...' }]),
      ...this.lastCols,
    ];
  }

  cargarLeyenda() {
    this.estadoAsistenciaService.findAll().subscribe((data) => {
      this.leyenda = data;
    });
  }

  cargarDias() {
    this.daysMonth = [];
    if (this.fechaSelected) {
      this.daysMonth = getDiasDelMes(this.fechaSelected);
      this.feriadoService.findAllByMonth(this.fechaSelected).subscribe({
        next: (feriados) => {
          this.daysMonth = this.daysMonth.map((item: any) => {
            const feriado = feriados.find((f: Feriado) => {
              const startDate = new Date(f.start);
              const fecha = new Date(item.fecha);
              return startDate?.getTime() == fecha?.getTime();
            });
            return { ...item, feriado: feriado?.title };
          });
        },
      });
    }
  }

  volver() {
    this.tabSelected = 'general';
    this.cargarAsistencia();
  }

  cargarAsistencia(q?: Record<string, any>) {
    this.fechaSelectedPrev = this.fechaSelected;

    this.asistenciaService
      .findAllByMonth(
        this.fechaSelected,
        this.selectedCargos,
        this.selectedSedes,
        this.searchText()
      )
      .subscribe({
        next: (data) => {
          this.dataTable = data.asistencia.map((item) => {
            item.labelName = `${item.nombre} ${item.apellido}`;
            return item;
          });
          this.cards = [
            {
              num: data.cards.faltas,
              label: 'Ausencias',
              classColor: 'bg-red-600 text-slate-50',
            },
            {
              num: data.cards.tardanzas,
              label: 'Tardanzas',
              classColor: 'bg-red-600 text-slate-50',
            },

            {
              num: data.cards.retiros,
              label: 'Retiro temprano',
              classColor: 'bg-red-600 text-slate-50',
            },
            {
              num: data.cards.sobretiempos,
              label: 'Sobretiempo',
              classColor: 'bg-green-600 text-slate-50',
            },
            {
              num: data.cards.vacaciones,
              label: 'Vacaciones',
              classColor: 'bg-purple-700 text-slate-50',
            },
            {
              num: data.cards.permisos,
              label: 'Permisos',
              classColor: 'bg-purple-700 text-slate-50',
            },
          ];
        },
      });
  }

  // loadData() {
  //   const q: Record<string, any> = {
  //     filter: false,
  //     isActive: true,
  //   };
  //   this.store.loadAll(this.limit(), this.offset(), q);
  // }

  search() {
    this.cargarAsistencia();
  }

  clear() {
    this.selectedCargos = [];
    this.selectedSedes = [];
    this.searchText.set('');
    this.limit.set(12);
    this.offset.set(0);
    this.cargarAsistencia();
  }

  onPageChange = ({ limit, offset }: { limit: number; offset: number }) => {
    this.limit.set(limit);
    this.offset.set(offset);
    this.search();
  };

  cambiarFecha(event: Date) {
    if (this.fechaSelectedPrev?.getTime() !== this.fechaSelected?.getTime()) {
      this.cargarDias();
      this.cargarAsistencia();
    }
  }

  select(item: any) {
    this.tabSelected = 'worker';
    this.itemSelected = item;
    this.dataTableWorker = item.marcaciones;
    this.cards = [
      {
        num: item.faltas,
        label: 'Ausencias',
        classColor: 'bg-red-600 text-slate-50',
      },
      {
        num: item.tardanzas,
        label: 'Tardanzas',
        classColor: 'bg-red-600 text-slate-50',
      },

      {
        num: item.retiros,
        label: 'Retiro temprano',
        classColor: 'bg-red-600 text-slate-50',
      },
      {
        num: item.sobretiempos,
        label: 'Sobretiempo',
        classColor: 'bg-green-600 text-slate-50',
      },
      {
        num: item.vacaciones,
        label: 'Vacaciones',
        classColor: 'bg-purple-700 text-slate-50',
      },
      {
        num: item.permisos,
        label: 'Permisos',
        classColor: 'bg-purple-700 text-slate-50',
      },
    ];
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }

  bgColor(codigo: string) {
    return this.leyenda.find((leyenda) => leyenda.codigo === codigo)?.bgColor;
  }

  textColor(codigo: string) {
    return this.leyenda.find((leyenda) => leyenda.codigo === codigo)?.textColor;
  }

  legendLabel(
    codigo: string,
    corregido: boolean,
    justificado: boolean,
    descanso: boolean
  ) {
    return `${
      this.leyenda.find((leyenda) => leyenda.codigo === codigo)?.nombre
    }${
      corregido
        ? ' | corregido'
        : justificado
        ? ' | justificado'
        : descanso
        ? ' | descanso'
        : ''
    }`;
  }

  getTotal(items: any[]) {
    return {
      hora: items.reduce((acc, item) => acc + item.horaTotal, 0),
      minuto: items.reduce((acc, item) => acc + item.minutoTotal, 0),
      dias: items.reduce(
        (acc, item) =>
          acc + (item.horaTotal != 0 || item.minutoTotal != 0 ? 1 : 0),
        0
      ),
      faltas: items.reduce(
        (acc, item) => acc + (item.codigo == 'F' ? 1 : 0),
        0
      ),
    };
  }

  verDetalle(item: any, marcacion: any) {
    this.dialogService.open(DetalleAsistenciaComponent, {
      header: 'Detalle de asistencia',
      styleClass: 'modal-4xl',
      data: {
        trabajador: {
          id: item.id,
          labelName: item.labelName,
          cargo: item?.cargo,
          sede: item?.sede,
        },
        marcacion: marcacion,
      },
      modal: true,
      dismissableMask: false,
      closable: true,
    });
  }
}
