import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
})
export class FormReemplazoComponent implements OnInit {
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
      this.formData.get('nombres')?.setValue(data['nombres']);
      this.formData.get('dni')?.setValue(data['dni']);
      this.formData.get('codigo')?.setValue(data['codigo']);
    }

    this.cargarTrabajadoresActivos();
  }

  // getArchivoBiometrico(id: string) {
  //   this.registroBiometricoService.obtenerArchivo(id).subscribe({
  //     next: (blob) => {
  //       this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(
  //         window.URL.createObjectURL(blob)
  //       );
  //     },
  //   });
  // }

  cargarReemplazo() {
    this.reemplaceroService.findAll().subscribe({
      next: (data) => {
        this.listaReemplaceros = data;
      },
    });
  }

  cargarTrabajadoresActivos() {
    // this.trabajadorService.findAllActivos().subscribe({
    //   next: (data) => {
    //     this.listaTrabajadores = data
    //       .filter(
    //         (item) =>
    //           item.contratos.filter((c) => c.cargo.isEditable).length != 0
    //       )
    //       .map((item) => {
    //         item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
    //         return item;
    //       });
    //   },
    // });
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
        : !this.archivo)
    );
  }

  guardar() {
    const form = this.formData.value;
    if (!this.id) {
      this.reemplaceroService.create(form).subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.reemplaceroService.update(this.id, form).subscribe({
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
