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
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageGlobalService } from '@services/message-global.service';
import { JustificacionInasistenciaService } from '@services/justificacion-inasistencia.service';
import { JustificacionInasistencia } from '@models/justificacion-inasistencia.model';

@Component({
  selector: 'app-form-inasistencia',
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
    CheckboxModule,
    TooltipModule,
  ],
  templateUrl: './form-inasistencia.component.html',
  styles: ``,
})
export class FormInasistenciaComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly justificacionInasistenciaService = inject(
    JustificacionInasistenciaService
  );

  trabajador!: string;
  sede!: string;
  cargo!: string;
  fecha!: Date;

  formData = new FormGroup({
    idTrabajador: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idHorarioTrabajador: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idHorarioTrabajadorItem: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nota: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    conGoce: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [],
    }),
    incluirExtra: new FormControl<boolean>(
      { value: false, disabled: true },
      {
        nonNullable: true,
        validators: [],
      }
    ),
  });

  id: string | undefined;

  archivo?: File;
  filename!: string;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;

    if (data) {
      this.id = data?.justificacion?.id;
      this.trabajador = `${data?.trabajador?.identificacion} | ${data?.trabajador?.nombre}`;
      this.cargo = data?.cargo?.nombre;
      this.sede = data?.sede?.nombre;
      console.log('data', data);
      this.formData.get('idTrabajador')?.setValue(data?.trabajador?.id);
      this.formData
        .get('idHorarioTrabajador')
        ?.setValue(data?.idHorarioTrabajador);
      this.formData
        .get('idHorarioTrabajadorItem')
        ?.setValue(data?.idHorarioTrabajadorItem);
      this.fecha = new Date(data?.fecha);
      this.formData.get('nota')?.setValue(data?.justificacion?.nota);
      this.formData.get('conGoce')?.setValue(data?.justificacion?.conGoce);
      this.formData
        .get('incluirExtra')
        ?.setValue(data?.justificacion?.incluirExtra);
    }
  }

  get conGoce(): boolean {
    return !!this.formData.get('conGoce')?.value;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file && file.type === 'application/pdf') {
      this.msg.info('Archivo cargado');
      this.archivo = file;
      this.filename = this.archivo.name;
    } else {
      this.msg.error('Archivo inválido. Solo se permiten archivos PDF.');
      event.target.value = '';
      this.archivo = undefined;
      this.filename = '';
    }
  }

  guardar() {
    const form = this.formData.value;
    if (!this.id) {
      this.justificacionInasistenciaService
        .create({ ...form, fecha: this.fecha, archivo: this.archivo })
        .subscribe({
          next: (data) => {
            this.msg.success('¡Registrado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            this.msg.error(e.error.message);
          },
        });
    } else {
      this.justificacionInasistenciaService
        .update(this.id, { ...form, fecha: this.fecha })
        .subscribe({
          next: (data) => {
            this.msg.success('¡Actualizado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            this.msg.error(e.error.message);
          },
        });
    }
  }
}
