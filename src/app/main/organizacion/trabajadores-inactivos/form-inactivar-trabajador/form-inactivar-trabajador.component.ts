import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
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
import { InactivacionService } from '@services/inactivacion.service';
import { InactivacionTrabajador } from '@models/inactivacionTrabajador.model';
import { Trabajador } from '@models/trabajador.model';
import { TrabajadorStore } from '@stores/trabajador.store';
import { TrabajadorInactivoStore } from '@stores/trabajador-inactivo.store';
import { MessageGlobalService } from '@services/message-global.service';
import { sanitizedForm } from '@functions/forms.function';

@Component({
  selector: 'app-form-inactivar-trabajador',
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
  templateUrl: './form-inactivar-trabajador.component.html',
  styles: ``,
})
export class FormInactivarTrabajadorComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(TrabajadorStore);

  private readonly trabajadorInactivoStore = inject(TrabajadorInactivoStore);

  private readonly inactivacionService = inject(InactivacionService);

  formData = new FormGroup({
    idTrabajador: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    motivoSuspension: new FormControl<string | undefined>(undefined, {
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
  isInactivos: boolean = false;
  idTrabajador: any;

  get listaTrabajadores(): Trabajador[] {
    return (
      this.isInactivos
        ? this.trabajadorInactivoStore.items()
        : this.store.items()
    ).map((item) => {
      item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.trabajadorInactivoStore.selectedItem();
    const error = this.trabajadorInactivoStore.error();
    const action = this.trabajadorInactivoStore.lastAction();

    // Manejo de errores
    if (error) {
      console.error('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al asignar edificios!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'updated') {
      this.msg.success('¡Edificios asignados exitosamente!');

      this.trabajadorInactivoStore.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item!) {
      this.formData.get('idTrabajador')?.setValue(item.id);

      if (item?.inactivaciones!) {
        this.id = item?.inactivaciones![0]?.id;
        this.formData
          .get('motivoSuspension')
          ?.setValue(item?.inactivaciones![0]?.motivoSuspension);
        this.formData
          .get('fechaInicio')
          ?.setValue(new Date(item?.inactivaciones![0]?.fechaInicio!));
        this.formData
          .get('fechaFin')
          ?.setValue(new Date(item?.inactivaciones![0]?.fechaFin!));
        this.formData.get('nota')?.setValue(item?.inactivaciones![0]?.nota!);

        this.formData.get('idTrabajador')?.disable();
      }
    }
  });

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    if (instance.data) {
      this.isInactivos = true;
      this.idTrabajador = instance.data['id'];
      this.precargar();
      this.cargarTrabajadoresActivos(false);
    } else {
      this.cargarTrabajadoresActivos();
    }
  }

  precargar() {
    this.trabajadorInactivoStore.loadById(this.idTrabajador!); /* .subscribe({
      next: (data) => {
        this.formData.get('idTrabajador')?.setValue(data.idTrabajador);
        this.formData.get('motivoSuspension')?.setValue(data.motivoSuspension);
        this.formData
          .get('fechaInicio')
          ?.setValue(new Date(data.fechaInicio));
        this.formData.get('nota')?.setValue(data.nota);
      },
    }); */
  }

  cargarTrabajadoresActivos(activos: boolean = true) {
    const q: Record<string, any> = {
      filter: false,
      isActive: activos,
    };
    if (activos) {
      this.store.loadAll(undefined, undefined, q);
    } else {
      this.trabajadorInactivoStore.loadAll(undefined, undefined, q);
    }
  }

  onUpload(event: any) {
    // Handle file upload logic here
  }

  guardar() {
    const form: InactivacionTrabajador = sanitizedForm(
      this.formData.getRawValue()
    );
    if (this.id) {
      this.inactivacionService
        .update(this.id, {
          ...form,
          id: this.id,
          idTrabajador: this.idTrabajador,
        } as InactivacionTrabajador)
        .subscribe({
          next: (data) => {
            this.ref.close(data);
            this.msg.success('¡Trabajador inactivado exitosamente!');
            // this.cargarTrabajadoresActivos();
          },
        });
    } else {
      this.inactivacionService.create(form).subscribe({
        next: (data) => {
          this.ref.close(data);
          this.msg.success('¡Trabajador inactivado exitosamente!');
          // this.cargarTrabajadoresActivos();
        },
      });
    }
  }
}
