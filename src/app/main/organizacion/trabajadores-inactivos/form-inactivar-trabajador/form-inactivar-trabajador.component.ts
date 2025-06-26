import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { TrabajadorService } from '@services/trabajador.service';
import { InactivacionService } from '@services/inactivacion.service';
import { InactivacionTrabajador } from '@models/inactivacionTrabajador.model';
import { map, mergeMap, of } from 'rxjs';
import { Trabajador } from '@models/trabajador.model';
import { TrabajadorStore } from '@stores/trabajador.store';

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

  private readonly trabajadorStore = inject(TrabajadorStore);

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
    fechaSuspension: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nota: new FormControl<string>('', {
      nonNullable: true,
      validators: [],
    }),
  });

  id: string | undefined;

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore.items().map((item) => {
      item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    if (instance.data) {
      this.id = instance.data['id'];
      this.formData.get('idTrabajador')?.disable();
      this.formData.get('motivoSuspension')?.disable();
      this.formData.get('fechaSuspension')?.disable();
      this.precargar();
      this.cargarTrabajadoresActivos(false);
    } else {
      this.cargarTrabajadoresActivos();
    }
  }

  precargar() {
    this.inactivacionService.findOne(this.id!).subscribe({
      next: (data) => {
        this.formData.get('idTrabajador')?.setValue(data.idTrabajador);
        this.formData.get('motivoSuspension')?.setValue(data.motivoSuspension);
        this.formData
          .get('fechaSuspension')
          ?.setValue(new Date(data.fechaSuspension));
        this.formData.get('nota')?.setValue(data.nota);
      },
    });
  }

  cargarTrabajadoresActivos(activos: boolean = true) {
    const q: Record<string, any> = {
      filter: false,
      isActive: activos,
    };
    this.trabajadorStore.loadAll(undefined, undefined, q);
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const { ...form } = this.formData.value;
    if (this.id) {
      this.inactivacionService
        .update(this.id, { ...form, id: this.id } as InactivacionTrabajador)
        .subscribe({
          next: (data) => {
            this.ref.close(data);
          },
        });
    } else {
      this.inactivacionService
        .create(form as InactivacionTrabajador)
        .pipe(
          map((data) => {
            const trabajador = this.listaTrabajadores.find(
              (t) => t.id === form.idTrabajador
            );
            if (trabajador && trabajador?.id) {
              const {
                id,
                nombre,
                apellido,
                genero,
                idPais,
                idTipoDocID,
                identificacion,
                idEstadoCivil,
              } = trabajador;
              this.trabajadorStore.update(
                id,
                {
                  id,
                  nombre,
                  apellido,
                  genero,
                  idPais,
                  idTipoDocID,
                  identificacion,
                  idEstadoCivil,
                  isActive: false,
                } as Trabajador,
                {}
              );
              return of([]);
            } else {
              return of([]);
            }
          })
        )
        .subscribe({
          next: (data) => {
            this.ref.close(data);
          },
        });
    }
  }
}
