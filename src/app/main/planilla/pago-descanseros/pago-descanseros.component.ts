import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { Cargo } from '@models/cargo.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { Sede } from '@models/sede.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TrabajadorService } from '@services/trabajador.service';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PopoverModule } from 'primeng/popover';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-pago-descanseros',
  imports: [
    CommonModule,
    ConfirmDialog,
    ToastModule,
    DatePickerModule,
    MultiSelectModule,
    SkeletonModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    FormsModule,
    PopoverModule,
    TooltipModule,
    TitleCardComponent,
    ButtonCustomComponent,
    ButtonCustomComponent,
  ],
  templateUrl: './pago-descanseros.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagoDescanserosComponent implements OnInit {
  title: string = 'Pago a descanseros';

  icon: string = 'material-symbols:list-alt-check-outline-sharp';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly trabajadorService = inject(TrabajadorService);

  fechaSelected!: Date;
  fechaSelectedPrev!: Date;

  cols!: Column[][];

  exportColumns!: ExportColumn[];

  dataTable: any[] = [];

  listaPagoMensual: any[] = [];

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

  loadingTable: boolean = false;
  skeletons: number[] = [];

  ngOnInit(): void {
    this.fechaSelected = new Date();

    this.cols = [
      [
        { field: 'ruc', header: 'RUC', align: 'center', rowSpan: '2' },
        {
          field: 'labelName',
          header: 'Nombre completo',
          rowSpan: '2',
          widthClass: '!min-w-80',
        },
        { field: 'cargo', header: 'Cargo', align: 'center', rowSpan: '2' },
        { field: 'sede', header: 'Edificios', align: 'center', rowSpan: '2' },
        {
          field: 'sueldoBasico',
          header: 'Pago diario',
          align: 'center',
          rowSpan: '2',
        },
        {
          field: 'diasTrabajados',
          header: 'Días trabajados',
          align: 'center',
          rowSpan: '2',
        },
        // { field: '', header: 'Horas extra', align: 'center', colSpan: '2' },
        // {
        //   field: 'sueldoBruto',
        //   header: 'Sueldo bruto',
        //   align: 'center',
        //   rowSpan: '2',
        // },
        {
          field: 'total',
          header: 'Total a pagar',
          align: 'center',
          rowSpan: '2',
        },
        {
          field: '',
          header: 'Acciones',
          align: 'center',
          rowSpan: '2',
          widthClass: '!min-w-32',
        },
      ],
      // [
      //   { field: 'horasExtra25', header: '25%', align: 'center' },
      //   { field: 'horasExtra35', header: '35%', align: 'center' },
      // ],
    ];

    this.skeletons = Array(
      this.cols[0]
        .map((item) => item.colSpan ?? '1')
        .map((item) => parseInt(item))
        .reduce((acc, val) => acc + val, 0)
    );

    this.exportColumns = this.cols
      .flatMap((level) => level)
      .filter((col) => col.field != '')
      .map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    // this.loadData();
    this.cargarPagosMensuales();
  }

  cargarPagosMensuales() {
    this.fechaSelectedPrev = this.fechaSelected;
    this.loadingTable = true;
    this.trabajadorService
      .findAllPagoByMonthDescanseros(this.fechaSelected)
      .subscribe({
        next: (data) => {
          this.listaPagoMensual = data.map((item) => {
          item.labelName = `${item.nombre} ${item.apellido}`;
          return item;
        });
          this.loadingTable = false;
          this.filtrar();
        },
      });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaPagoMensual.filter(
      (t) =>
        t.sedes.some((s: Sede) => this.selectedSedes.includes(s.id)) &&
        this.selectedCargos.includes(t.cargo.id)
    );
  }

  cambiarFecha(event: Date) {
    if (this.fechaSelectedPrev?.getTime() !== this.fechaSelected?.getTime()) {
      this.cargarPagosMensuales();
    }
  }

  getComprobante(item: any) {
    // this.dialogService.open(ComprobantePagoComponent, {
    //   header: 'Boleta de pago',
    //   styleClass: 'modal-6xl',
    //   position: 'center',
    //   data: { trabajador: item },
    //   dismissableMask: false,
    //   closable: true,
    // });
  }

  getCalculoPago(item: any) {
    // this.dialogService.open(CalculoPagoComponent, {
    //   header: 'Cálculo de pago',
    //   styleClass: 'modal-4xl',
    //   data: { id: item.id, fecha: this.fechaSelected },
    //   modal: true,
    //   dismissableMask: false,
    //   closable: true,
    // });
  }

  confirm(event: Event) {
    // this.confirmationService.confirm({
    //   target: event.target as EventTarget,
    //   message: '¿Estas seguro de emitir todos los comprobantes?',
    //   header: 'Confirmación',
    //   icon: 'pi pi-info-circle',
    //   rejectLabel: 'Cancel',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'danger',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Aceptar',
    //     severity: 'info',
    //   },
    //   accept: () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: '¡Éxito!',
    //       detail: 'Comprobantes enviados',
    //     });
    //   },
    //   reject: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Rejected',
    //       detail: 'You have rejected',
    //     });
    //   },
    // });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
