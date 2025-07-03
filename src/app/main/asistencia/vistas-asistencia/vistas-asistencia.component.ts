import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit } from '@angular/core';
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
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { MultiSelectModule } from 'primeng/multiselect';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { AsistenciaService } from '@services/asistencia.service';
import { getDiasDelMes } from '@functions/fecha.function';
import { Cargo } from '@models/cargo.model';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { forkJoin, mergeMap } from 'rxjs';
import { DetalleAsistenciaComponent } from './detalle-asistencia/detalle-asistencia.component';
import { EstadoAsistenciaService } from '@services/estado-asistencia.service';
import { EstadoAsistencia } from '@models/estado-asistencia.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { ChipModule } from 'primeng/chip';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom/button-custom.component';

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
    DialogModule,
    SelectModule,
    SelectButtonModule,
    TagModule,
    DatePickerModule,
    TooltipModule,
    ChipModule,
    PopoverModule,
    MultiSelectModule,
    TitleCardComponent,
    ButtonCustomComponent,
  ],
  templateUrl: './vistas-asistencia.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VistasAsistenciaComponent implements OnInit {
  title: string = 'Vistas de asistencia';

  icon: string = 'material-symbols:calendar-month-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly sedeStore = inject(SedeStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly asistenciaService = inject(AsistenciaService);

  private readonly estadoAsistenciaService = inject(EstadoAsistenciaService);

  fechaSelected!: Date;

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

  dataTableWorker: any[] = [];

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore.items().slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  listaTrabajadores: Trabajador[] = [];

  listaAsistenciaMensual: any[] = [];

  cards: any[] = [];

  leyenda: EstadoAsistencia[] = [];

  dataTable: any[] = [];
  itemSelected: any;

  ngOnInit(): void {
    this.fechaSelected = new Date();
    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.cargarDias();
    this.cargarLeyenda();
    this.cargarAsistencia();
  }

  cargarLeyenda() {
    this.estadoAsistenciaService.findAll().subscribe((data) => {
      this.leyenda = data;
      console.log('this.leyenda', this.leyenda);
    });
  }

  cargarDias() {
    this.daysMonth = [];
    if (this.fechaSelected) {
      this.daysMonth = getDiasDelMes(this.fechaSelected);
    }
  }

  volver() {
    this.tabSelected = 'general';
    this.cargarAsistencia();
  }

  cargarAsistencia() {
    this.asistenciaService.findAllByMonth(this.fechaSelected).subscribe({
      next: (data) => {
        this.listaAsistenciaMensual = data.asistencia.map((item) => {
          item.labelName = `${item.nombre} ${item.apellido}`;
          // item.asistencia = this.generarAsistencia();
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
        this.filtrar();
      },
    });
  }

  filtrar(event?: number) {
    console.log('this.listaAsistenciaMensual', this.listaAsistenciaMensual);
    this.dataTable = this.listaAsistenciaMensual.filter(
      (t) =>
        t.sedes.some((s: Sede) => this.selectedSedes.includes(s.id)) &&
        this.selectedCargos.includes(t.cargo.id)
    );

    console.log('this.dataTable', this.dataTable);
  }

  cambiarFecha(event: Date) {
    this.cargarDias();
    this.cargarAsistencia();
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

  legendLabel(codigo: string, corregido: boolean, justificado: boolean) {
    return `${
      this.leyenda.find((leyenda) => leyenda.codigo === codigo)?.nombre
    }${corregido ? ' | corregido' : justificado ? ' | justificado' : ''}`;
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
    console.log(item);

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
