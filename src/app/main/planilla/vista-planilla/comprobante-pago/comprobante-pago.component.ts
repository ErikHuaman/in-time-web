import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrabajadorService } from '@services/trabajador.service';
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

  private readonly trabajadorService = inject(TrabajadorService);

  fechaContrato!: Date;

  periodo = new Date();

  formData: any;

  mesSelected!: Date;
  id!: string;

  constructor(
    public ref: DynamicDialogRef,
    private dialogService: DialogService
  ) {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;
    if (data) {
      this.id = data['id'];
      this.mesSelected = new Date(data['fecha']);

      this.getLocaleDateFormat();
    }
  }

  getLocaleDateFormat() {
    this.trabajadorService
      .findComprobantePagoByMonthAndIdTrabajador(this.id, this.mesSelected)
      .subscribe({
        next: (data) => {
          this.formData = data;
          this.fechaContrato = new Date(this.formData?.datos?.fechaIngreso);
        },
      });
  }
}
