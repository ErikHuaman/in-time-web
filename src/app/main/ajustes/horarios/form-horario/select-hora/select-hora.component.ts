import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { listaColores } from '@functions/color.function';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { AutoFocusModule } from 'primeng/autofocus';
import { BloqueHoras } from '@models/bloque-horas.model';
import { BloqueHorasService } from '@services/bloque-horas.service';
import { TurnoTrabajoService } from '@services/turno-trabajo.service';
import { TurnoTrabajo } from '@models/turno-trabajo.model';

@Component({
  selector: 'app-select-hora',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    AutoFocusModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
  ],
  templateUrl: './select-hora.component.html',
  styles: ``,
})
export class SelectHoraComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly bloqueHorasService = inject(BloqueHorasService);

  private readonly turnoTrabajoService = inject(TurnoTrabajoService);

  listaColores: any[] = [];

  focusForm: boolean = false;

  entrada!: Date;

  salida!: Date;

  selectedColor: number = 0;

  bloqueHora: BloqueHoras = {
    horaEntrada: undefined,
    minutoEntrada: undefined,
    horaSalida: undefined,
    minutoSalida: undefined,
    bgColor: undefined,
    textColor: undefined,
    borderColor: undefined,
    idTurnoTrabajo: undefined,
  };

  listaTurnos: TurnoTrabajo[] = [];

  ngOnInit(): void {
    this.cargarTurnos();
    this.listaColores = listaColores;
    this.bloqueHora.bgColor = listaColores[this.selectedColor].bgColor;
    this.bloqueHora.textColor = listaColores[this.selectedColor].textColor;
    this.bloqueHora.borderColor = listaColores[this.selectedColor].borderColor;
  }

  cargarTurnos() {
    this.turnoTrabajoService.findAll().subscribe({
      next: (data) => {
        this.listaTurnos = data;
      },
    });
  }

  selectEntrada(event: any) {
    if (this.entrada) {
      this.bloqueHora.horaEntrada = this.entrada.getHours();
      this.bloqueHora.minutoEntrada = this.entrada.getMinutes();
    }
  }

  selectSalida(event: any) {
    if (this.salida) {
      this.bloqueHora.horaSalida = this.salida.getHours();
      this.bloqueHora.minutoSalida = this.salida.getMinutes();
    }
  }

  selectColor(index: number) {
    this.selectedColor = index;
    this.bloqueHora.bgColor = listaColores[this.selectedColor].bgColor;
    this.bloqueHora.textColor = listaColores[this.selectedColor].textColor;
    this.bloqueHora.borderColor = listaColores[this.selectedColor].borderColor;
  }

  guardar() {
    this.bloqueHorasService.findAll().subscribe({
      next: (data) => {
        const bloque = data.find(
          (b) =>
            b.idTurnoTrabajo === this.bloqueHora.idTurnoTrabajo &&
            b.horaEntrada === this.bloqueHora.horaEntrada &&
            b.minutoEntrada === this.bloqueHora.minutoEntrada &&
            b.horaSalida === this.bloqueHora.horaSalida &&
            b.minutoSalida === this.bloqueHora.minutoSalida
        );
        if (!bloque) {
          this.bloqueHorasService.create(this.bloqueHora).subscribe({
            next: (data) => {
              this.ref.close({ id: data.id });
            },
          });
        } else {
          this.ref.close({ id: bloque.id });
        }
      },
    });
  }
}
