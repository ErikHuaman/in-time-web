import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FormHorarioComponent } from './form-horario/form-horario.component';
import { RouterModule } from '@angular/router';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { Column, ExportColumn } from '@models/column-table.model';
import { TooltipModule } from 'primeng/tooltip';
import { HorarioTrabajador } from '@models/horario-trabajador.model';
import { Cargo } from '@models/cargo.model';
import { HorarioTrabajadorItem } from '@models/horario-trabajador-item.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { Sede } from '@models/sede.model';
import { MessageGlobalService } from '@services/message-global.service';
import { Trabajador } from '@models/trabajador.model';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { HorarioTrabajadorService } from '@services/horario-trabajador.service';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';

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
    InputTextModule,
    TooltipModule,
    DialogModule,
    SelectModule,
    SkeletonTableDirective,
    TabsModule,
    TitleCardComponent,
    // PaginatorDirective,
    ButtonCustomComponent,
    BtnDeleteComponent,
  ],
  templateUrl: './horarios.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HorariosComponent {
  title: string = 'Horarios';

  icon: string = 'material-symbols:calendar-clock-outline';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly service = inject(HorarioTrabajadorService);

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  limitPost = signal(12);
  offsetPost = signal(0);
  totalItemsPost = signal(0);
  limitHist = signal(12);
  offsetHist = signal(0);
  totalItemsHist = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  cols!: Column[];

  exportColumns!: ExportColumn[];

  fechaSelected!: Date;

  dataTable: HorarioTrabajador[] = [];
  dataTablePosterior: HorarioTrabajador[] = [];
  dataTableHistorico: HorarioTrabajador[] = [];

  ngOnInit(): void {
    this.cols = [
      {
        field: 'identificacion',
        header: 'Doc ID',
        align: 'center',
        widthClass: '!min-w-32',
      },
      { field: 'nombre', header: 'Nombre completo', widthClass: '!min-w-64' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      {
        field: 'tipoPatron',
        header: 'Tipo de patrón horario',
        align: 'center',
        widthClass: '!min-w-32',
      },
      {
        field: 'periodo',
        header: 'Periodo',
        align: 'center',
        widthClass: '!min-w-38',
      },
      {
        field: 'semana',
        header: 'Semana',
        align: 'center',
        widthClass: '!min-w-16',
      },
      {
        field: 'domingo',
        header: 'Domingo',
        align: 'center',
        widthClass: '!w-24',
      },
      { field: 'lunes', header: 'Lunes', align: 'center', widthClass: '!w-24' },
      {
        field: 'martes',
        header: 'Martes',
        align: 'center',
        widthClass: '!w-24',
      },
      {
        field: 'miercoles',
        header: 'Miércoles',
        align: 'center',
        widthClass: '!w-24',
      },
      {
        field: 'jueves',
        header: 'Jueves',
        align: 'center',
        widthClass: '!w-24',
      },
      {
        field: 'viernes',
        header: 'Viernes',
        align: 'center',
        widthClass: '!w-24',
      },
      {
        field: 'sabado',
        header: 'Sábado',
        align: 'center',
        widthClass: '!w-24',
      },
      {
        field: '',
        header: '',
        align: 'center',
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

  loadData(q?: Record<string, any>) {
    this.service
      .getAll(undefined, undefined, {
        filter: false,
        isActive: true,
        ...q,
      })
      .subscribe({
        next: (res) => {
          this.dataTable = res.data.map((item) => {
            item.trabajador = {
              ...item.trabajador,
              labelName: `${item.trabajador?.nombre} ${item.trabajador?.apellido}`,
            } as Trabajador;
            return item;
          });
          this.totalItems.set(res.total!);
        },
      });

    this.service
      .getAll(undefined, undefined, {
        filter: false,
        isActive: true,
        tipo: '1',
        ...q,
      })
      .subscribe({
        next: (res) => {
          this.dataTablePosterior = res.data.map((item) => {
            item.trabajador = {
              ...item.trabajador,
              labelName: `${item.trabajador?.nombre} ${item.trabajador?.apellido}`,
            } as Trabajador;
            return item;
          });
          this.totalItemsPost.set(res.total!);
        },
      });
    this.service
      .getAll(undefined, undefined, {
        filter: false,
        isActive: true,
        tipo: '2',
        ...q,
      })
      .subscribe({
        next: (res) => {
          this.dataTableHistorico = res.data.map((item) => {
            item.trabajador = {
              ...item.trabajador,
              labelName: `${item.trabajador?.nombre} ${item.trabajador?.apellido}`,
            } as Trabajador;
            return item;
          });
          this.totalItemsHist.set(res.total!);
        },
      });
  }

  search() {
    this.loadData({
      search: this.searchText(),
      sedes: this.selectedSedes,
      cargos: this.selectedCargos,
    });
  }

  clear() {
    this.selectedCargos = [];
    this.selectedSedes = [];
    this.searchText.set('');
    this.limit.set(12);
    this.offset.set(0);
    this.limitPost.set(12);
    this.offsetPost.set(0);
    this.limitHist.set(12);
    this.offsetHist.set(0);
    this.loadData();
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  onPageChangePost(event: { limit: number; offset: number }) {
    this.limitPost.set(event.limit);
    this.offsetPost.set(event.offset);
    this.loadData();
  }

  onPageChangeHist(event: { limit: number; offset: number }) {
    this.limitHist.set(event.limit);
    this.offsetHist.set(event.offset);
    this.loadData();
  }

  // cargarHorarioTrabajadores() {
  //   this.loadingTable = true;
  //   this.horarioTrabajadorService.findAll().subscribe({
  //     next: (data) => {
  //       this.listaHorarioTrabajadores = data;
  //       this.loadingTable = false;
  //       this.filtrar();
  //     },
  //   });
  // }

  getDias(items: HorarioTrabajadorItem[]): number[] {
    return [
      ...new Set(
        items?.map((item: HorarioTrabajadorItem) => item.diaSemEntrada)
      ),
    ]
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
    return items.find((h) => h.diaSemEntrada === dia && h.numTurno === turno);
  }

  addNew() {
    const ref = this.dialogService.open(FormHorarioComponent, {
      header: 'Nuevo horario',
      styleClass: 'modal-6xl',
      modal: true,
      draggable: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  editarHorario(item: HorarioTrabajador) {
    const ref = this.dialogService.open(FormHorarioComponent, {
      header: 'Editar horario',
      styleClass: 'modal-6xl',
      data: item,
      modal: true,
      draggable: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.loadData();
      }
    });
  }

  remove(item: HorarioTrabajador) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
            <p class='text-center'> ¿Está seguro de eliminar el horario de <span class='uppercase font-bold'>${item.trabajador?.labelName}</span>? </p>
            <p class='text-center'> Esta acción eliminará las marcaciones de asistencia del  trabajador y no se puede deshacer. </p>
          </div>`,
      () => {
        this.service.delete(item.id!).subscribe({
          next: (res) => {
            this.loadData();
          },
        });
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
