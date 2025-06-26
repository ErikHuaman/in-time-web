import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioTrabajadorItem } from '@models/horario-trabajador-item.model';
import { PatronHorarioItem } from '@models/patron-horario-item.model';
import { PatronHorario } from '@models/patron-horario.model';
import { MessageGlobalService } from '@services/message-global.service';
import { PatronHorarioItemService } from '@services/patron-horario-item.service';
import { PatronHorarioService } from '@services/patron-horario.service';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-form-patron',
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './form-patron.component.html',
  styles: ``,
})
export class FormPatronComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  public readonly msg = inject(MessageGlobalService);

  private readonly patronHorarioService = inject(PatronHorarioService);

  private readonly patronHorarioItemService = inject(PatronHorarioItemService);

  viewForm: boolean = false;

  listaItems: PatronHorarioItem[] = [];
  patron!: PatronHorario;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    if (instance.data) {
      const data = instance.data;
      this.patron = {
        idTipoTurno: data.idTipoTurno,
      };
      this.listaItems = Array.from<HorarioTrabajadorItem>(data.items).map(
        (item: HorarioTrabajadorItem) => {
          const patron: PatronHorarioItem = {
            idBloqueHoras: item.idBloqueHoras,
            numDia: item.numDia,
            numTurno: item.numTurno,
            diaLibre: item.diaLibre,
            diaDescanso: item.diaDescanso,
          };
          return patron;
        }
      );
    }
  }

  cancelar() {
    this.ref.close(true);
  }

  guardar() {
    this.patronHorarioService
      .create(this.patron)
      .pipe(
        mergeMap((data) =>
          this.patronHorarioItemService.createMany(
            this.listaItems.map((item) => {
              item.idPatronHorario = data.id;
              return item;
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.ref.close(data);
        },
        error: (e) => {
          console.log(e);
          this.msg.error(e.error.message);
        },
      });
  }
}
