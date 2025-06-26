import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsistenciaService } from '@services/asistencia.service';
import { Asistencia } from '@models/asistencia.model';
import { TrabajadorService } from '@services/trabajador.service';
import { Trabajador } from '@models/trabajador.model';
import { mergeMap } from 'rxjs';
import { CorreccionMarcacionService } from '@services/correccion-marcacion.service';

@Component({
  selector: 'app-form-correccion-marcacion',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FileUploadModule,
  ],
  templateUrl: './form-correccion-marcacion.component.html',
  styles: ``,
})
export class FormCorreccionMarcacionComponent implements OnInit {
  corrected: boolean = false;
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly correccionMarcacionService = inject(
    CorreccionMarcacionService
  );

  formData = new FormGroup({
    idAsistencia: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fecha: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    marcacionEntrada: new FormControl<Date | undefined>(
      { value: undefined, disabled: false },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    marcacionSalida: new FormControl<Date | undefined>(
      { value: undefined, disabled: false },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    nota: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: string;
  entrada?: Date;
  salida?: Date;
  trabajador?: string;
  cargo?: string;
  sede?: string;
  fecha?: Date;
  marcacionEntrada?: Date;
  marcacionSalida?: Date;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;

    if (data) {
      this.id = data.asistencia?.correccion?.id;
      this.trabajador = `${data?.identificacion} | ${data?.nombre}`;
      this.cargo = data.cargo?.nombre;
      this.sede = data.sede?.nombre;
      this.fecha = new Date(data.fecha);
      this.formData.get('idAsistencia')?.setValue(data.asistencia.id);
      this.formData.get('fecha')?.setValue(new Date(data.fecha));
      if (data.asistencia?.correccion?.marcacionEntrada) {
        this.marcacionEntrada = new Date(
          data.asistencia?.correccion?.marcacionEntrada
        );
        this.formData.get('marcacionEntrada')?.setValue(this.marcacionEntrada);
      }
      if (data.asistencia?.correccion?.marcacionSalida) {
        this.marcacionSalida = new Date(
          data.asistencia?.correccion?.marcacionSalida
        );
        this.formData.get('marcacionSalida')?.setValue(this.marcacionSalida);
      }
      this.formData.get('nota')?.setValue(data.asistencia?.correccion?.nota);
      this.entrada = data.horario?.entrada
        ? new Date(data.horario.entrada)
        : undefined;
      this.salida = data.horario?.salida
        ? new Date(data.horario.salida)
        : undefined;
    }
  }

  selectEntrada(event: any) {
    if (this.entrada) {
      const fechaEntrada = new Date(this.entrada);
      fechaEntrada.setHours(
        this.entrada.getHours(),
        this.entrada.getMinutes(),
        0,
        0
      );
      this.formData.get('marcacionEntrada')?.setValue(fechaEntrada);
    }
  }

  selectSalida(event: any) {
    if (this.salida) {
      const fechaSalida = new Date(this.salida);
      fechaSalida.setHours(
        this.salida.getHours(),
        this.salida.getMinutes(),
        0,
        0
      );
      this.formData.get('marcacionSalida')?.setValue(fechaSalida);
    }
  }

  guardar() {
    const form = this.formData.value;
    if (!this.id) {
      this.correccionMarcacionService
        .create({
          ...form,
        })
        .subscribe({
          next: (data) => {
            this.ref.close(data);
          },
        });
    } else {
      this.correccionMarcacionService
        .update(this.id, {
          ...form,
        })
        .subscribe({
          next: (data) => {
            this.ref.close(data);
          },
        });
    }
  }
}
