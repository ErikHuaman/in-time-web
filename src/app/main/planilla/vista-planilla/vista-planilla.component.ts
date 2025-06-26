import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComprobantePagoComponent } from './comprobante-pago/comprobante-pago.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalculoPagoComponent } from './calculo-pago/calculo-pago.component';
import { TrabajadorService } from '@services/trabajador.service';
import { Column, ExportColumn } from '@models/column-table.model';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin, mergeMap } from 'rxjs';
import { TitleCardComponent } from '@components/title-card/title-card.component';

@Component({
  selector: 'app-vista-planilla',
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
    TitleCardComponent,
  ],
  templateUrl: './vista-planilla.component.html',
  styles: ``,
  providers: [ConfirmationService, MessageService, DialogService],
})
export class VistaPlanillaComponent implements OnInit {
  title: string = 'Vista Planilla';

  icon: string = 'material-symbols:list-alt-check-outline-sharp';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly confirmationService = inject(ConfirmationService);

  private readonly messageService = inject(MessageService);

  private readonly sedeService = inject(SedeService);

  private readonly cargoService = inject(CargoService);

  private readonly trabajadorService = inject(TrabajadorService);

  fechaSelected!: Date;

  cols!: Column[][];

  exportColumns!: ExportColumn[];

  dataTable: any[] = [];

  listaPagoMensual: any[] = [];

  listaSedes: Sede[] = [];

  selectedSedes: string[] = [];

  listaCargos: Cargo[] = [];

  selectedCargos: string[] = [];

  loadingTable: boolean = false;
  skeletons: number[] = [];

  ngOnInit(): void {
    this.fechaSelected = new Date('2025/04/01');

    this.cols = [
      [
        { field: 'ruc', header: 'RUC', align: 'center', rowSpan: '2' },
        { field: 'nombre', header: 'Nombre', rowSpan: '2' },
        { field: 'apellido', header: 'Apellido', rowSpan: '2' },
        { field: 'sede', header: 'Edificio', align: 'center', rowSpan: '2' },
        { field: 'cargo', header: 'Cargo', align: 'center', rowSpan: '2' },
        {
          field: 'sueldoBasico',
          header: 'Sueldo básico',
          align: 'center',
          rowSpan: '2',
        },
        { field: '', header: 'Horas extra', align: 'center', colSpan: '2' },
        {
          field: 'feriados',
          header: 'Feriados',
          align: 'center',
          rowSpan: '2',
        },
        {
          field: 'salarioVacaciones',
          header: 'Vacaciones',
          align: 'center',
          rowSpan: '2',
        },
        { field: 'faltas', header: 'Faltas', align: 'center', rowSpan: '2' },
        {
          field: 'sueldoBruto',
          header: 'Sueldo bruto',
          align: 'center',
          rowSpan: '2',
        },
        { field: 'onp', header: 'ONP', align: 'center', rowSpan: '2' },
        { field: 'afp', header: 'AFP', align: 'center', rowSpan: '2' },
        { field: 'sis', header: 'SIS', align: 'center', rowSpan: '2' },
        { field: 'sctr', header: 'SCTR', align: 'center', rowSpan: '2' },
        { field: 'essalud', header: 'ESSALUD', align: 'center', rowSpan: '2' },
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
          widthClass: '!w-36',
        },
      ],
      [
        { field: 'horasExtra25', header: '25%', align: 'center' },
        { field: 'horasExtra35', header: '35%', align: 'center' },
      ],
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

    this.cargarPagosMensuales();
  }

  cargarPagosMensuales() {
    this.loadingTable = true;
    forkJoin([
      /* this.sedeService.findAll(), this.cargoService.findAll() */
    ])
      .pipe(
        mergeMap((arr) => {
          /* this.listaSedes = arr[0];
          this.selectedSedes = this.listaSedes.map((item) => item.id); */
          // this.listaCargos = arr[1];
          // this.selectedCargos = this.listaCargos.map((item) => item.id);
          return this.trabajadorService.findAllPagoByMonth(this.fechaSelected);
        })
      )
      .subscribe({
        next: (data) => {
          this.listaPagoMensual = data;
          this.loadingTable = false;
          this.filtrar();
        },
      });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaPagoMensual.filter(
      (t) =>
        this.selectedSedes.includes(t.sede.id) &&
        this.selectedCargos.includes(t.cargo.id)
    );
  }

  cambiarFecha(event: Date) {
    this.cargarPagosMensuales();
  }

  getComprobante(item: any) {
    this.dialogService.open(ComprobantePagoComponent, {
      header: 'Datos de boleta de pago',
      styleClass: 'modal-5xl',
      position: 'top',
      data: { trabajador: item },
      dismissableMask: true,
      closable: true,
    });
  }

  getCalculoPago(item: any) {
    this.dialogService.open(CalculoPagoComponent, {
      header: 'Cálculo de pago',
      styleClass: 'modal-4xl',
      data: { id: item.id, fecha: this.fechaSelected },
      modal: true,
      dismissableMask: true,
      closable: true,
    });
  }

  confirm(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estas seguro de emitir todos los comprobantes?',
      header: 'Confirmación',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'danger',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'info',
      },

      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Éxito!',
          detail: 'Comprobantes enviados',
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
        });
      },
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
