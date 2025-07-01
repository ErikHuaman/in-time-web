import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
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
import { CargoService } from '@services/cargo.service';
import { SedeService } from '@services/sede.service';
import { TrabajadorService } from '@services/trabajador.service';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { VacacionService } from '@services/vacacion.service';
import { MessageGlobalService } from '@services/message-global.service';
import { TrabajadorStore } from '@stores/trabajador.store';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { sanitizedForm } from '@functions/forms.function';
import { Vacacion } from '@models/vacacion.model';
import { diferenciaDias } from '@functions/fecha.function';

@Component({
  selector: 'app-form-vacaciones',
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
  templateUrl: './form-vacaciones.component.html',
  styles: ``,
})
export class FormVacacionesComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly trabajadorStore = inject(TrabajadorStore);

  private readonly vacacionService = inject(VacacionService);

  private readonly msg = inject(MessageGlobalService);
  diasUtiles: number = 15;

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore.items().map((item) => {
      item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
      return item;
    });
  }
  listaTrabajadoresFiltrados: Trabajador[] = [];
  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore.items();
  }

  private sedesEffect = effect(() => {
    const sedes = this.sedeStore.items();
    if (sedes) {
      this.filtrar();
    }
  });

  private cargosEffect = effect(() => {
    const cargos = this.cargoStore.items();
    if (cargos) {
      this.filtrar();
    }
  });

  private trabajadoresEffect = effect(() => {
    const sedes = this.trabajadorStore.items();
    if (sedes) {
      this.filtrar();
    }
  });

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
    diasDisponibles: new FormControl<number | undefined>(15, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    diasUtilizados: new FormControl<number | undefined>(15, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaInicio: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaFin: new FormControl<Date | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
  });

  id!: string;
  minDate!: Date;
  maxDate!: Date;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    if (instance.data) {
      this.id = instance.data['id'];
      this.formData.get('idSede')!.setValue(instance.data['idSede']);
      this.formData.get('idCargo')!.setValue(instance.data['idCargo']);
      this.formData
        .get('idTrabajador')!
        .setValue(instance.data['idTrabajador']);
      this.diasUtiles =
        instance.data['diasDisponibles'] +
        diferenciaDias(
          new Date(instance.data['fechaInicio']),
          new Date(instance.data['fechaFin'])
        ) + 1;
      this.formData.get('diasDisponibles')!.setValue(this.diasUtiles);
      this.formData
        .get('diasUtilizados')!
        .setValue(instance.data['diasUtilizados']);
      this.formData
        .get('fechaInicio')!
        .setValue(new Date(instance.data['fechaInicio']));
      this.formData
        .get('fechaFin')!
        .setValue(new Date(instance.data['fechaFin']));

      this.selectFechaInicio();
    }

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.cargarTrabajadoresActivos();
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
          .map((s) => s.id)
          .includes(this.formData.get('idSede')!.value as string) &&
        item.contratos[0].idCargo === this.formData.get('idCargo')!.value
    );
  }

  selectFechaInicio(event?: any) {
    this.minDate = this.formData.get('fechaInicio')!.value as Date;
    this.maxDate = new Date(this.minDate);
    this.maxDate.setDate(this.maxDate.getDate() + this.diasUtiles - 1);
    this.formData.get('fechaFin')!.enable();
    if (event) {
      this.formData.get('fechaFin')!.setValue(undefined);
    }
  }

  selectFechaFin(event: any) {
    const diferenciaEnDias =
      diferenciaDias(
        this.formData.get('fechaInicio')!.value!,
        this.formData.get('fechaFin')!.value!
      ) + 1;
    this.formData.get('diasUtilizados')!.setValue(diferenciaEnDias);
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const form: Vacacion = sanitizedForm(this.formData.getRawValue());
    if (!this.id) {
      this.vacacionService
        .create({
          ...form,
          diasUtilizados: form.diasUtilizados,
          diasDisponibles:
            (form.diasDisponibles as number) - (form.diasUtilizados as number),
        })
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
      this.vacacionService
        .update(this.id, {
          ...form,
          diasUtilizados: form.diasUtilizados,
          diasDisponibles: this.diasUtiles - (form.diasUtilizados as number),
        })
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
