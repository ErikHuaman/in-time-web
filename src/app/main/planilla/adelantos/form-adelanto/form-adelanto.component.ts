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
import { InputNumberModule } from 'primeng/inputnumber';
import { AdelantoService } from '@services/adelanto.service';
import { Trabajador } from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TrabajadorStore } from '@stores/trabajador.store';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { AdelantoStore } from '@stores/adelanto.store';
import { CheckboxModule } from 'primeng/checkbox';
import { sanitizedForm } from '@functions/forms.function';

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
    CheckboxModule,
  ],
  templateUrl: './form-adelanto.component.html',
  styles: ``,
})
export class FormAdelantoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(AdelantoStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly trabajadorStore = inject(TrabajadorStore);

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
  listaTrabajadoresFiltrados: Trabajador[] = [];

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  private sedesEffect = effect(() => {
    const items = this.trabajadorStore.items();
    if (items) {
      this.filtrar();
    }
  });

  selfMonth: boolean = true;

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
    fechaDescuento: new FormControl<Date | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
  });

  id!: string;

  listaMotivos = [
    {
      id: 1,
      nombre: 'Motivos personales',
    },
  ];

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (
      action === 'created' ||
      action === 'updated' ||
      action === 'createMany'
    ) {
      this.msg.success(
        action === 'created'
          ? '¡Adelanto de sueldo creado exitosamente!'
          : action === 'updated'
          ? 'Adelanto de sueldo actualizado exitosamente!'
          : 'Adelanto de sueldo creados exitosamente!'
      );

      // this.formData.reset({
      //   name: '',
      //   description: undefined,
      //   status: true,
      // });

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && this.id !== item.id) {
      this.id = item.id!;
      console.log('item', item);
      this.formData.patchValue({
        idSede: item.idSede,
        idCargo: item.idCargo,
        idTrabajador: item.idTrabajador,
        montoAdelanto: item.montoAdelanto,
        cuotasDescuento: item.cuotasDescuento,
        fechaAdelanto: new Date(item.fechaAdelanto!),
        fechaDescuento: new Date(item.fechaDescuento!),
      });
      this.formData.get('idSede')!.disable();
      this.formData.get('idCargo')!.disable();
      this.formData.get('idTrabajador')!.disable();

      this.filtrar();
    }
  });

  ngOnInit(): void {
    this.cargarTrabajadoresActivos();
  }

  cargarTrabajadoresActivos() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.trabajadorStore.loadAll(undefined, undefined, q);
  }

  // filtrar(event?: any) {
  //   this.listaTrabajadoresFiltrados = this.listaTrabajadores.filter(
  //     (item) =>
  //       item.sedes[0]?.id === this.formData.get('idSede')?.value &&
  //       item.contratos[0].idCargo === this.formData.get('idCargo')?.value
  //   );
  //   console.log('Lista de Trabajadores Filtrados :', this.listaTrabajadoresFiltrados)
  // }

  filtrar(event?: any) {
    const idSede = this.formData.get('idSede')?.value;
    const idCargo = this.formData.get('idCargo')?.value;

    this.listaTrabajadoresFiltrados = this.listaTrabajadores.filter(
      (item) =>
        item.sedes?.some((sede) => sede.id === idSede) &&
        item.contratos[0]?.idCargo === idCargo
    );
    console.log('Lista de Trabajadores Filtrados:', this.listaTrabajadoresFiltrados);
  }

  changeSelfMonth(event: any) {
    if (this.selfMonth) {
      this.formData
        .get('fechaDescuento')!
        .setValue(this.formData.get('fechaAdelanto')?.value);
      this.formData.get('fechaDescuento')?.disable();
    } else {
      this.formData.get('fechaDescuento')?.enable();
    }
  }

  changeFechaDescuento() {
    console.log('changeFechaDescuento');
    if (this.selfMonth) {
      this.formData
        .get('fechaDescuento')!
        .setValue(this.formData.get('fechaAdelanto')?.value);
    }
  }

  onUpload(event: any) {
    // Handle file upload logic here
    console.log(event.files);
  }

  guardar() {
    const form = sanitizedForm(this.formData.getRawValue());

    if (!this.id) {
      this.store.create({ ...form, cuotasDescuento: 1 });
    } else {
      this.store.update(this.id, { ...form, cuotasDescuento: 1 });
    }
  }
}
