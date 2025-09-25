import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TrabajadorService } from '@services/trabajador.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-calculo-pago',
  imports: [CommonModule],
  templateUrl: './calculo-pago.component.html',
  styles: ``,
})
export class CalculoPagoComponent implements OnInit {
  mesSelected!: Date;
  id!: string;

  formData: any;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly trabajadorService = inject(TrabajadorService);

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.id = data['id'];
      this.mesSelected = new Date(data['fecha']);

      this.cargarData();
    }
  }

  cargarData() {
    this.trabajadorService
      .findOnePagoByMonthAndIdTrabajador(this.id, this.mesSelected)
      .subscribe({
        next: (data) => {
          this.formData = data;
        },
      });
  }
}
