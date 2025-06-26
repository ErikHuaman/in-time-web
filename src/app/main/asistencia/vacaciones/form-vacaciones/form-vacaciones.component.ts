import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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

  private readonly cargoService = inject(CargoService);

  private readonly sedeService = inject(SedeService);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly vacacionService = inject(VacacionService);

  private readonly msg = inject(MessageGlobalService);

  listaTrabajadores: Trabajador[] = [];
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
      this.formData.controls['idSede'].setValue(instance.data['idSede']);
      this.formData.controls['idCargo'].setValue(instance.data['idCargo']);
      this.formData.controls['idTrabajador'].setValue(
        instance.data['idTrabajador']
      );
      this.formData.controls['fechaInicio'].setValue(
        new Date(instance.data['fechaInicio'])
      );
      this.formData.controls['fechaFin'].setValue(
        new Date(instance.data['fechaFin'])
      );
    }

    this.cargarSedes();
    this.cargarCargos();
    this.cargarTrabajadoresActivos();
  }

  cargarSedes() {
    this.sedeService.findAll().subscribe({
      next: (data) => {
        this.listaSedes = data;
      },
    });
  }

  cargarCargos() {
    this.cargoService.findAll().subscribe({
      next: (data) => {
        this.listaCargos = data;
      },
    });
  }

  cargarTrabajadoresActivos() {
    // this.trabajadorService.findAllActivos().subscribe({
    //   next: (data) => {
    //     this.listaTrabajadores = data.map((item) => {
    //       item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
    //       return item;
    //     });
    //     this.filtrar();
    //   },
    // });
  }

  filtrar(event?: any) {
    this.listaTrabajadoresFiltrados = this.listaTrabajadores.filter(
      (item) =>
        item.sedes
          .map((s) => s.id)
          .includes(this.formData.get('idSede')?.value as string) &&
        item.contratos[0].idCargo === this.formData.get('idCargo')?.value
    );
  }

  selectFechaInicio(event: any) {
    this.formData.get('fechaFin')?.enable();
    this.minDate = this.formData.get('fechaInicio')?.value as Date;
    this.maxDate = new Date(this.minDate);

    this.maxDate.setDate(this.maxDate.getDate() + 15);
  }

  selectFechaFin(event: any) {
    const fin = this.formData.get('fechaFin')?.value as Date;
    const inicio = this.formData.get('fechaInicio')?.value as Date;
    const diferenciaEnMilisegundos = fin.getTime() - inicio.getTime();
    const diferenciaEnDias = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);
    this.formData.get('diasUtilizados')?.setValue(diferenciaEnDias);
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const form = this.formData.value;
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
          diasDisponibles:
            (form.diasDisponibles as number) - (form.diasUtilizados as number),
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
