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
import { StepperModule } from 'primeng/stepper';
import { InputOtpModule } from 'primeng/inputotp';
import { ReemplaceroService } from '@services/reemplacero.service';
import { Reemplacero } from '@models/reemplacero.model';
import { FormReemplazoComponent } from '../form-reemplazo/form-reemplazo.component';
import { TrabajadorStore } from '@stores/trabajador.store';
import { sanitizedForm } from '@functions/forms.function';
import { ReemplazoHorario } from '@models/reemplazo-horario.model';

@Component({
  selector: 'app-form-asignar-reemplazo',
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
  templateUrl: './form-asignar-reemplazo.component.html',
  styles: ``,
})
export class FormAsignarReemplazoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly trabajadorStore = inject(TrabajadorStore);

  private readonly reemplaceroService = inject(ReemplaceroService);

  private readonly reemplazoHorarioService = inject(ReemplazoHorarioService);

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore
      .items()
      .filter(
        (item) => item.contratos.filter((c) => c.cargo.isEditable).length != 0
      )
      .map((item) => {
        item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
        return item;
      });
  }
  listaReemplaceros: Reemplacero[] = [];
  selectedReemplazo?: Reemplacero;
  listaSedes: Sede[] = [];
  listaCargos: Cargo[] = [];

  formData = new FormGroup({
    idTrabajador: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idReemplacero: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    pago: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaInicio: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaFin: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nota: new FormControl<string>('', {
      nonNullable: true,
      validators: [],
    }),
  });

  id: string | undefined;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.id = data['id'];
      this.formData.get('idTrabajador')?.setValue(data['idTrabajador']);
      this.formData.get('idReemplacero')?.setValue(data['idReemplacero']);
      this.formData.get('pago')?.setValue(data['pago']);
      this.formData.get('fechaInicio')?.setValue(new Date(data['fechaInicio']));
      this.formData.get('fechaFin')?.setValue(new Date(data['fechaFin']));
      this.formData.get('nota')?.setValue(data['nota']);
    }

    this.cargarTrabajadoresActivos();
    this.cargarReemplazo();
  }

  cargarReemplazo() {
    this.reemplaceroService.findAll().subscribe({
      next: (data) => {
        this.listaReemplaceros = data;
        if (this.formData.get('idReemplacero')?.value) {
          this.selectedReemplazo = this.listaReemplaceros.find(
            (item) => item.id === this.formData.get('idReemplacero')?.value
          );
        }
      },
    });
  }

  cargarTrabajadoresActivos() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.trabajadorStore.loadAll(undefined, undefined, q);
  }

  nuevoReemplazo() {
    const ref = this.dialogService.open(FormReemplazoComponent, {
      header: 'Nuevo reemplazero',
      styleClass: 'modal-sm',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarReemplazo();
      }
    });
  }

  selectReemplacero(event: any) {
    this.formData.get('idReemplacero')?.setValue(this.selectedReemplazo?.id);
  }

  guardar() {
    const form: ReemplazoHorario = sanitizedForm(this.formData.getRawValue());
    if (!this.id) {
      this.reemplazoHorarioService.create(form).subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.reemplazoHorarioService.update(this.id, form).subscribe({
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
