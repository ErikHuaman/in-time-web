import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { TrabajadorService } from '@services/trabajador.service';
import { ReemplazoHorarioService } from '@services/reemplazo-horario.service';
import { MessageGlobalService } from '@services/message-global.service';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StepperModule } from 'primeng/stepper';
import { InputOtpModule } from 'primeng/inputotp';
import { generarCodigoNumerico } from '@functions/number.function';
import { ReemplaceroService } from '@services/reemplacero.service';
import { Reemplacero } from '@models/reemplacero.model';
import { sanitizedForm } from '@functions/forms.function';
import { environment } from '@environments/environments';

@Component({
  selector: 'app-form-reemplazo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FileUploadModule,
    RadioButtonModule,
    StepperModule,
    InputOtpModule,
  ],
  templateUrl: './form-reemplazo.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormReemplazoComponent implements OnInit {
  readonly baseUrl: string = environment.urlBase;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly sanitizer = inject(DomSanitizer);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly reemplaceroService = inject(ReemplaceroService);

  listaTrabajadores: Trabajador[] = [];
  listaReemplaceros: Reemplacero[] = [];
  selectedReemplazo: any;
  listaSedes: Sede[] = [];
  listaCargos: Cargo[] = [];

  formData = new FormGroup({
    nombres: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dni: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    codigo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [],
    }),
  });

  id: string | undefined;

  previewUrl: SafeUrl = '';

  listaModo = [
    {
      value: 'exist',
      label: 'Reemplazo existente',
    },
    {
      value: 'new',
      label: 'Nuevo reemplazo',
    },
  ];

  modo: 'exist' | 'new' = 'exist';
  tipoVerificacion: 'codigo' | 'foto' = 'codigo';
  archivo?: File;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.id = data['id'];
      this.formData.get('nombres')?.setValue(data.nombres);
      this.formData.get('dni')?.setValue(data.dni);
      this.formData.get('codigo')?.setValue(data.codigo);

      if (data.codigo) {
        this.tipoVerificacion = 'codigo';
        this.formData.get('codigo')?.setValue(data.codigo);
      } else {
        this.tipoVerificacion = 'foto';
        this.previewUrl = `${this.baseUrl}${data.urlFile}`.replace(
          '//uploads',
          '/uploads'
        );
      }
    }
  }

  cargarReemplazo() {
    this.reemplaceroService.findAll().subscribe({
      next: (data) => {
        this.listaReemplaceros = data;
      },
    });
  }

  changeTipo(event: any) {
    this.formData.get('codigo')?.setValue(undefined);
    this.previewUrl = '';
    this.archivo = undefined;
  }

  generarCodigo() {
    const codigo = generarCodigoNumerico();
    this.formData.get('codigo')?.setValue(codigo);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
          );
          this.archivo = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  get invalid(): boolean {
    return (
      this.formData.invalid ||
      (this.tipoVerificacion == 'codigo'
        ? !this.formData.get('codigo')?.value
        : !this.previewUrl)
    );
  }

  guardar() {
    const form: Reemplacero = sanitizedForm(this.formData.getRawValue());
    if (!this.id) {
      this.reemplaceroService.create(form, { file: this.archivo }).subscribe({
        next: (data) => {
          this.msg.success('¡Reemplazo registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.reemplaceroService
        .update(this.id, form, { file: this.archivo })
        .subscribe({
          next: (data) => {
            this.msg.success('¡Reemplazo actualizado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            this.msg.error(e.error.message);
          },
        });
    }
  }
}
