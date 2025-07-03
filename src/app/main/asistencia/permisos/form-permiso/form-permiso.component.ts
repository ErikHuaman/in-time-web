import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { CargoService } from '@services/cargo.service';
import { SedeService } from '@services/sede.service';
import { TrabajadorService } from '@services/trabajador.service';
import { MessageGlobalService } from '@services/message-global.service';
import { PermisoTrabajadorService } from '@services/permiso-trabajador.service';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { InputOtpModule } from 'primeng/inputotp';
import { TrabajadorStore } from '@stores/trabajador.store';
import { sanitizedForm } from '@functions/forms.function';

@Component({
  selector: 'app-form-permiso',
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
    ToggleSwitchModule,
    CheckboxModule,
    TooltipModule,
    InputOtpModule,
  ],
  templateUrl: './form-permiso.component.html',
  styles: ``,
})
export class FormPermisoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoService = inject(CargoService);

  private readonly sedeService = inject(SedeService);

  private readonly trabajadorStore = inject(TrabajadorStore);

  private readonly permisoService = inject(PermisoTrabajadorService);

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore.items().map((item) => {
      item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  listaTrabajadoresFiltrados: Trabajador[] = [];
  listaSedes: Sede[] = [];
  listaCargos: Cargo[] = [];

  formData = new FormGroup({
    idSede: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idCargo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idTrabajador: new FormControl<string | undefined>(undefined, {
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
    nota: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [],
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

  private resetOnSuccessEffect = effect(() => {
    const items = this.trabajadorStore.items();

    // Manejo de errores
    if (items) {
      this.filtrar();
    }
  });

  ngOnInit(): void {
    this.cargarTrabajadoresActivos();
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;
    if (data) {
      this.id = data['id'];
      this.formData.controls['idSede'].setValue(data['idSede']);
      this.formData.controls['idCargo'].setValue(data['idCargo']);
      this.formData.controls['idTrabajador'].setValue(data['idTrabajador']);
      this.formData.controls['fechaInicio'].setValue(
        new Date(data['fechaInicio'])
      );
      this.formData.controls['fechaFin'].setValue(new Date(data['fechaFin']));
      this.formData.controls['nota'].setValue(data['nota']);
      this.formData.controls['conGoce'].setValue(data['conGoce']);
      this.formData.controls['incluirExtra'].setValue(data['incluirExtra']);

      if (data['conGoce']) {
        this.formData.controls['incluirExtra'].enable();
      }
    }

    this.cargarSedes();
    this.cargarCargos();
  }

  cargarSedes() {
    this.sedeService.findAll().subscribe({
      next: (data) => {
        this.listaSedes = data;
        this.listaSedes.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.filtrar();
      },
    });
  }

  cargarCargos() {
    this.cargoService.findAll().subscribe({
      next: (data) => {
        this.listaCargos = data;
        this.filtrar();
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

  filtrar(event?: any) {
    this.listaTrabajadoresFiltrados = this.listaTrabajadores.filter(
      (item) =>
        item.sedes
          .map((sede) => sede.id)
          .includes(this.formData.get('idSede')?.value!) &&
        item.contratos[0].idCargo === this.formData.get('idCargo')?.value
    );
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
    const form = sanitizedForm(this.formData.getRawValue());
    if (!this.id) {
      this.permisoService
        .create({ ...form }, { file: this.archivo })
        .subscribe({
          next: (data) => {
            this.msg.success('¡Permiso registrado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            this.msg.error(e.error.message);
          },
        });
    } else {
      this.permisoService.update(this.id, form).subscribe({
        next: (data) => {
          this.msg.success('¡Permiso actualizado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    }
  }
}
