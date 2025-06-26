import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-comprobante-pago',
  imports: [
    CommonModule,
    ButtonModule,
    FieldsetModule,
    TableModule,
    InputTextModule,
    FormsModule,
    SelectModule,
  ],
  templateUrl: './comprobante-pago.component.html',
  styles: ``,
})
export class ComprobantePagoComponent {
  instance: DynamicDialogComponent | undefined;
  trabajador: any;

  fechaActual = new Date();

  periodo = new Date();

  datos = {
    ruc: '20609735571',
    razonSocial:
      ' JIRÓN PÍO XII NUMERO 393-A, 393, 393-C URBANIZACIÓN FUNDO MONTERRICO CHICO SANTIAGO DE SURCO',
    tipoDoc: 'DNI',
    identificacion: '11111111',
    nombre: 'Erik',
    apellido: 'Huaman Guiop',
    situacion: 'activo o subsidiado',
    fechaIngreso: new Date(),
    tipoTrabajador: 'empleado',
    regimenPensionario: 'spp profuturo',
    cuspp: '256971NPMDH0',
    diasLaborados: 31,
    diasNoLaborados: 0,
    diasSubcidiados: 0,
    condicion: 'Domiciliado',
    totalHoras: 208,
    minutos: 0,
    totalHorasExtra: 78,
    minutosExtra: 0,
    suspencionTipo: '',
    suspencionMotivo: '',
    suspencionDias: '',
    quintaCategoria: 'No tiene',
  };

  grupoDetalle = [
    {
      nombre: 'Ingresos',
      monto: '',
      items: [
        {
          codigo: '0105',
          nombre: 'TRABAJO SOBRETIEMPO (H. EXTRAS 25%)',
          ingreso: '363.13',
          descuento: '',
          neto: '',
        },
        {
          codigo: '0106',
          nombre: 'TRABAJO SOBRETIEMPO (H. EXTRAS 35%)',
          ingreso: '190.69',
          descuento: '',
          neto: '',
        },
        {
          codigo: '0121',
          nombre: 'REMUNERACIÓN O JORNAL BÁSICO',
          ingreso: '1130.00',
          descuento: '',
          neto: '',
        },
      ],
    },
    {
      nombre: 'Descuentos',
      monto: '',
      items: [
        {
          codigo: '0701',
          nombre: 'ADELANTO',
          ingreso: '',
          descuento: '700.00',
          neto: '',
        },
        {
          codigo: '0705',
          nombre: 'INASISTENCIAS',
          ingreso: '',
          descuento: '0.00',
          neto: '',
        },
      ],
    },
    {
      nombre: 'Aportes del Trabajador',
      monto: '',
      items: [
        {
          codigo: '0601',
          nombre: 'COMISIÓN AFP PORCENTUAL',
          ingreso: '',
          descuento: '0.00',
          neto: '',
        },
        {
          codigo: '0605',
          nombre: 'RENTA QUINTA CATEGORÍA RETENCIONES',
          ingreso: '',
          descuento: '0.00',
          neto: '',
        },
        {
          codigo: '0606',
          nombre: 'PRIMA DE SEGURO AFP',
          ingreso: '',
          descuento: '22.93',
          neto: '',
        },
        {
          codigo: '0608',
          nombre: 'SPP - APORTACIÓN OBLIGATORIA',
          ingreso: '',
          descuento: '167.38',
          neto: '',
        },
      ],
    },
  ];

  pagoNeto = '783.51';

  aportes = [
    {
      codigo: '0804',
      nombre: 'ESSALUD(REGULAR CBSSP AGRAR/AC)TRAB',
      ingreso: '',
      descuento: '',
      neto: '150.64',
    },
  ];

  constructor(
    public ref: DynamicDialogRef,
    private dialogService: DialogService
  ) {
    this.instance = this.dialogService.getInstance(this.ref);
    this.trabajador = this.instance.data['trabajador'];
  }
}
