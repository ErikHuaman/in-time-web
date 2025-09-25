import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
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
import { sanitizedForm } from '@functions/forms.function';

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
    conGoce: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [],
    }),
    incluirExtra: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [],
    }),
  });

  id: string | undefined;

  archivos: File[] = [];
  filenames: string[] = [];

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;

    if (data) {
      this.id = data?.justificacion?.id;
      this.trabajador = `${data?.trabajador?.identificacion} | ${data?.trabajador?.nombre}`;
      this.cargo = data?.cargo?.nombre;
      this.sede = data?.sede?.nombre;
      this.fecha = new Date(data?.fecha);
      this.formData.patchValue({
        idTrabajador: data?.trabajador?.id,
        idHorarioTrabajador: data?.idHorarioTrabajador,
        idHorarioTrabajadorItem: data?.idHorarioTrabajadorItem,
        nota: data?.justificacion?.nota,
        conGoce: !this.id ? true : data?.justificacion?.conGoce,
        incluirExtra: !this.id ? false : data?.justificacion?.incluirExtra,
      });
    }
  }

  get conGoce(): boolean {
    return !!this.formData.get('conGoce')?.value;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    // Si quieres reemplazar todo, descomenta estas dos líneas:
    this.archivos = [];
    this.filenames = [];

    files.forEach((file) => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        this.msg.info(`Archivo cargado: ${file.name}`);
        this.archivos.push(file);
        this.filenames.push(file.name);
      } else {
        this.msg.error(`Archivo inválido: ${file.name}. Solo PDF o imágenes.`);
      }
    });

    // Reset del input para permitir volver a elegir el mismo archivo
    input.value = '';
  }

  clearFile(index?: number) {
    if (!index) {
      this.archivos = [];
      this.filenames = [];
    } else {
      // Eliminar solo el archivo en la posición indicada
      this.archivos?.splice(index, 1);
      this.filenames?.splice(index, 1);
    }
  }

  guardar() {
    const form: JustificacionInasistencia = sanitizedForm(
      this.formData.getRawValue()
    );
    if (!this.id) {
      this.justificacionInasistenciaService
        .create({ ...form, fecha: this.fecha }, { file: this.archivos })
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
        .update(
          this.id,
          { ...form, fecha: this.fecha },
          { file: this.archivos }
        )
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
