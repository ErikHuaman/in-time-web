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
import { Cargo } from '@models/cargo.model';

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

  private readonly sedeStore = inject(SedeStore);

  private readonly asignacionSedeService = inject(AsignacionSedeService);

  private readonly trabajadorService = inject(TrabajadorService);

  listaTrabajadores: any[] = [];

  get listaSedes(): Sede[] {
    return this.sedeStore.items();
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

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.idTrabajador = data.idTrabajador;
      this.formData.get('idTrabajador')?.setValue(data.idTrabajador);
      this.formData.get('idTrabajador')?.disable();
      this.precargar();
    }
    this.cargarSedes();
    this.cargarTrabajadoresActivos();
  }

  precargar() {
    if (this.idTrabajador) {
      this.asignacionSedeService
        .findAllByTrabajador(this.idTrabajador)
        .subscribe({
          next: (data) => {
            this.formData.get('idSedes')?.setValue(data.map((item) => item.id));
            this.asignaciones.clear();
            data.forEach((item) => {
              const asignacionFormGroup = new FormGroup({
                id: new FormControl<string | undefined>(item.id, {
                  nonNullable: true,
                  validators: [],
                }),
                idSede: new FormControl<string | undefined>(item.id, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                nombreSede: new FormControl<string>(item.sede.nombre, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                fechaAsignacion: new FormControl<Date | undefined>(
                  new Date(item.fechaAsignacion),
                  {
                    nonNullable: true,
                    validators: [Validators.required],
                  }
                ),
              });
              this.asignaciones.push(asignacionFormGroup);
            });
          },
        });
    }
  }

  cargarSedes() {
    // this.sedeService.findAll().subscribe({
    //   next: (data) => {
    //     this.listaSedes = data;
    //   },
    // });
  }

  cargarTrabajadoresActivos() {
    this.trabajadorService.findAllActivos().subscribe({
      next: (data) => {
        this.listaTrabajadores = data.map((item) => {
          item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
          return item;
        });
      },
    });
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
    this.asignacionSedeService
      .multipleCreate(
        array.map((item) => {
          return {
            id: item.id ?? undefined,
            idSede: item.id,
            idTrabajador,
            fechaAsignacion: item.fechaAsignacion,
          } as AsignacionSede;
        })
      )
      .subscribe({
        next: (data) => {
          this.ref.close(data);
        },
      });
  }
}
