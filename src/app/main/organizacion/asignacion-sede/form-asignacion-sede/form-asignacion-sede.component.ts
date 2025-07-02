import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
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
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SedeService } from '@services/sede.service';
import { TrabajadorService } from '@services/trabajador.service';
import { AsignacionSedeService } from '@services/asignacion-sede.service';
import { AsignacionSede } from '@models/asignacion-sede.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { SedeStore } from '@stores/sede.store';
import { Sede } from '@models/sede.model';
import { TrabajadorStore } from '@stores/trabajador.store';
import { Trabajador } from '@models/trabajador.model';
import { MessageGlobalService } from '@services/message-global.service';

@Component({
  selector: 'app-form-asignacion-sede',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FileUploadModule,
  ],
  templateUrl: './form-asignacion-sede.component.html',
  styles: ``,
})
export class FormAsignacionSedeComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly sedeStore = inject(SedeStore);

  // private readonly asignacionSedeService = inject(AsignacionSedeService);

  private readonly store = inject(TrabajadorStore);

  get listaTrabajadores(): Trabajador[] {
    return this.store.items().map((item) => {
      item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  get listaSedes(): Sede[] {
    return this.sedeStore.items().slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  formData = new FormGroup({
    idTrabajador: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idSedes: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
    asignaciones: new FormArray([]),
  });
  idTrabajador!: string;

  get asignaciones(): FormArray {
    return this.formData.get('asignaciones') as FormArray;
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al asignar edificios!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'updated') {
      this.msg.success('¡Edificios asignados exitosamente!');

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item) {
      this.formData.get('idSedes')?.setValue(item.sedes.map((item) => item.id));
      this.asignaciones.clear();
      console.log("item.sedes", item.sedes)
      item.sedes.forEach((item) => {
        const asignacionFormGroup = new FormGroup({
          id: new FormControl<string | undefined>(item.id, {
            nonNullable: true,
            validators: [],
          }),
          idSede: new FormControl<string | undefined>(item.id, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          nombreSede: new FormControl<string>(item.nombre, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          fechaAsignacion: new FormControl<Date | undefined>(
            new Date(item?.AsignacionSede?.fechaAsignacion!),
            {
              nonNullable: true,
              validators: [Validators.required],
            }
          ),
        });
        this.asignaciones.push(asignacionFormGroup);
      });
    }
  });

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.idTrabajador = data.idTrabajador;
      this.formData.get('idTrabajador')?.setValue(data.idTrabajador);
      this.formData.get('idTrabajador')?.disable();
      this.precargar();
    }
    this.cargarTrabajadoresActivos();
  }

  precargar() {
    if (this.idTrabajador) {
      this.store.loadById(this.idTrabajador);
      // .findAllByTrabajador(this.idTrabajador)
      // .subscribe({
      //   next: (data) => {
      //     this.formData.get('idSedes')?.setValue(data.map((item) => item.id));
      //     this.asignaciones.clear();
      //     data.forEach((item) => {
      //       const asignacionFormGroup = new FormGroup({
      //         id: new FormControl<string | undefined>(item.id, {
      //           nonNullable: true,
      //           validators: [],
      //         }),
      //         idSede: new FormControl<string | undefined>(item.id, {
      //           nonNullable: true,
      //           validators: [Validators.required],
      //         }),
      //         nombreSede: new FormControl<string>(item.sede.nombre, {
      //           nonNullable: true,
      //           validators: [Validators.required],
      //         }),
      //         fechaAsignacion: new FormControl<Date | undefined>(
      //           new Date(item.fechaAsignacion),
      //           {
      //             nonNullable: true,
      //             validators: [Validators.required],
      //           }
      //         ),
      //       });
      //       this.asignaciones.push(asignacionFormGroup);
      //     });
      //   },
      // });
    }
  }

  cargarTrabajadoresActivos() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.store.loadAll(undefined, undefined, q);
  }

  selectTrabajador(id: string) {
    this.idTrabajador = id;
    this.precargar();
  }

  selectSedes(idSedes: string[]) {
    if (!idSedes || idSedes.length === 0) {
      this.asignaciones.clear();
      return;
    }
    this.asignaciones.controls.forEach((asignacion) => {
      const idSede = asignacion.get('idSede')?.value;
      if (!idSedes.includes(idSede)) {
        this.asignaciones.removeAt(
          this.asignaciones.controls.indexOf(asignacion)
        );
      }
    });
    // Clear existing assignments

    idSedes.forEach((idSede) => {
      const sede = this.listaSedes.find((sede) => sede.id === idSede);
      if (!sede) return;
      const { id, nombre } = sede;
      const existe = this.asignaciones.controls.find(
        (asignacion) => asignacion.get('idSede')?.value === idSede
      );
      if (existe) return;
      const asignacionFormGroup = new FormGroup({
        id: new FormControl<string | undefined>(undefined, {
          nonNullable: true,
          validators: [],
        }),
        idSede: new FormControl<string | undefined>(id, {
          nonNullable: true,
          validators: [Validators.required],
        }),
        nombreSede: new FormControl<string>(nombre, {
          nonNullable: true,
          validators: [Validators.required],
        }),
        fechaAsignacion: new FormControl<Date | undefined>(undefined, {
          nonNullable: true,
          validators: [Validators.required],
        }),
      });
      this.asignaciones.push(asignacionFormGroup);
    });
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const idTrabajador = this.formData.get('idTrabajador')?.value;
    const array: any[] = this.formData.get('asignaciones')?.value ?? [];
    this.store.update(
      idTrabajador!,
      {
        sedes: array.map((item) => ({
          id: item.idSede,
          AsignacionSede: {
            fechaAsignacion: item.fechaAsignacion,
          },
        })),
      } as Trabajador,
      {}
    );
  }
}
