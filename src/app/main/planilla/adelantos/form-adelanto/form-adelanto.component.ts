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
import { InputNumberModule } from 'primeng/inputnumber';
import { AdelantoService } from '@services/adelanto.service';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { MessageGlobalService } from '@services/message-global.service';

@Component({
  selector: 'app-form-adelanto',
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
  ],
  templateUrl: './form-adelanto.component.html',
  styles: ``,
})
export class FormAdelantoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly cargoService = inject(CargoService);

  private readonly sedeService = inject(SedeService);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly adelantoService = inject(AdelantoService);

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
    montoAdelanto: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cuotasDescuento: new FormControl<number | undefined>(
      { value: 1, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    fechaAdelanto: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fechaDescuento: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: string;

  listaMotivos = [
    {
      id: 1,
      nombre: 'Motivos personales',
    },
  ];

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    if (instance.data) {
      this.id = instance.data['id'];
      this.formData.controls['idSede'].setValue(instance.data['idSede']);
      this.formData.controls['idCargo'].setValue(instance.data['idCargo']);
      this.formData.controls['idTrabajador'].setValue(
        instance.data['idTrabajador']
      );
      this.formData.controls['montoAdelanto'].setValue(
        instance.data['montoAdelanto']
      );
      this.formData.controls['cuotasDescuento'].setValue(
        instance.data['cuotasDescuento']
      );
      this.formData.controls['fechaAdelanto'].setValue(
        new Date(instance.data['fechaAdelanto'])
      );
      this.formData.controls['fechaDescuento'].setValue(
        new Date(instance.data['fechaDescuento'])
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
    this.trabajadorService.findAllActivos().subscribe({
      next: (data) => {
        this.listaTrabajadores = data
          .filter((item) => item.sedes[0]?.id)
          .map((item) => {
            item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
            return item;
          });

        this.filtrar(null);
      },
    });
  }

  filtrar(event: any) {
    this.listaTrabajadoresFiltrados = this.listaTrabajadores.filter(
      (item) =>
        item.sedes[0]?.id === this.formData.get('idSede')?.value &&
        item.contratos[0].idCargo === this.formData.get('idCargo')?.value
    );
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const form = this.formData.value;
    if (!this.id) {
      this.adelantoService.create(form).subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.adelantoService.update(this.id, form).subscribe({
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
