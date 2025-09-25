import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Cargo } from '@models/cargo.model';
import { NacionalidadService } from '@services/nacionalidad.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { mergeMap, of } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TurnoTrabajoService } from '@services/turno-trabajo.service';
import { Ciudad, Pais, Provincia, Region } from '@models/nacionalidad.model';
import { FrecuenciaPago } from '@models/frecuencia-pago.model';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';
import { TiempoContrato } from '@models/tiempo-contrato.model';
import { FrecuenciaPagoService } from '@services/frecuencia-pago.service';
import { TiempoContratoService } from '@services/tiempo-contrato.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EstadoCivil } from '@models/estado-civil.model';
import { EstadoCivilService } from '@services/estado-civil.service';
import {
  BeneficioTrabajador,
  ContactoTrabajador,
  ContratoTrabajador,
  ControlTrabajador,
  InfoTrabajador,
  Trabajador,
} from '@models/trabajador.model';
import { RegistroBiometrico } from '@models/registro-biometrico.model';
import { SeguroSaludService } from '@services/seguro-salud.service';
import { FondoPensionesService } from '@services/fondo-pensiones.service';
import { TurnoTrabajo } from '@models/turno-trabajo.model';
import { SeguroSalud } from '@models/seguro-salud.model';
import { FondoPensiones } from '@models/fondo-pensiones.model';
import { MessageGlobalService } from '@services/message-global.service';
import { InputOtpModule } from 'primeng/inputotp';
import { generarCodigoNumerico } from '@functions/number.function';
import { RadioButtonModule } from 'primeng/radiobutton';

import * as fs from 'file-saver-es';
import { TrabajadorStore } from '@stores/trabajador.store';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { Sede } from '@models/sede.model';
import { TipoDocIdentStore } from '@stores/tipo-doc-ident.store';
import { Workbook } from 'exceljs';
import { CheckboxModule } from 'primeng/checkbox';
import { environment } from '@environments/environments';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-form-trabajador',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    ToggleSwitchModule,
    RadioButtonModule,
    InputOtpModule,
    CheckboxModule,
  ],
  templateUrl: './form-trabajador.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormTrabajadorComponent implements OnInit {
  readonly baseUrl: string = environment.urlBase;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(TrabajadorStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly nacionalidadService = inject(NacionalidadService);

  private readonly turnoTrabajoService = inject(TurnoTrabajoService);

  private readonly tipoDocStore = inject(TipoDocIdentStore);

  private readonly frecuenciaPagoService = inject(FrecuenciaPagoService);

  private readonly tiempoContratoService = inject(TiempoContratoService);

  private readonly estadoCivilService = inject(EstadoCivilService);

  private readonly seguroService = inject(SeguroSaludService);

  private readonly fondoPensionesService = inject(FondoPensionesService);

  private readonly sanitizer = inject(DomSanitizer);

  archivo?: File;

  avanzado: boolean = false;

  formData = new FormGroup({
    trabajador: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      nombre: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      apellido: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      genero: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idPais: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idTipoDocID: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      identificacion: new FormControl<string | undefined>(
        { value: undefined, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      fechaNacimiento: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      idEstadoCivil: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      isActive: new FormControl<boolean>(true, {
        nonNullable: true,
        validators: [],
      }),
    }),
    biometrico: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      codigo: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
    }),
    control: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      idTurnoTrabajo: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      marcacionAutomatica: new FormControl<boolean | undefined>(false),
    }),
    contrato: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      idCargo: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      numNomina: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      fechaContrato: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      fechaInicio: new FormControl<Date | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idTiempoContrato: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idFrecuenciaPago: new FormControl<string | undefined>(
        { value: undefined, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      horasContrato: new FormControl<number | undefined>(
        { value: undefined, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      salarioMensual: new FormControl<number | undefined>(
        { value: undefined, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
    }),
    info: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      idCiudad: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      direccion: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      celular: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      correo: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
    }),
    contacto: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      nombre: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      apellido: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      parentezco: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      celular: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      correo: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
    }),
    beneficio: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      pagoFeriado: new FormControl<number | undefined>(0),
      bonoAdicional: new FormControl<number | undefined>(0),
      idSeguroSalud: new FormControl<string | undefined>(undefined),
      idFondoPensiones: new FormControl<string | undefined>(undefined),
      aplicaComision: new FormControl<boolean>(false),
    }),
  });

  paisDefault?: Pais;
  idRegion?: string;
  idProvincia?: string;
  listaPaises: Pais[] = [];
  listaDepartamentos: Region[] = [];
  listaProvincias: Provincia[] = [];
  listaCiudades: Ciudad[] = [];
  listaTurnos: TurnoTrabajo[] = [];

  get listaSedes(): Sede[] {
    return this.sedeStore.items();
  }

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }
  id?: string;

  listaGeneros = ['FEMENINO', 'MASCULINO'];
  listaSeguroSalud: SeguroSalud[] = [];
  listaFondosPensiones: FondoPensiones[] = [];

  get listaTipoDocId(): TipoDocIdent[] {
    return this.tipoDocStore.items();
  }
  listaEstadoCivil: EstadoCivil[] = [];
  listaFrecuenciaPagoAll: FrecuenciaPago[] = [];

  get listaFrecuenciaPago(): FrecuenciaPago[] {
    if (
      this.listaCargos.find(
        (item) => item.id === this.formData.get('contrato.idCargo')?.value
      )?.isDescansero
    ) {
      this.isDiario = true;
      return this.listaFrecuenciaPagoAll.filter(
        (item) => item.serialNumber == 1
      );
    } else {
      this.isDiario = false;
      return this.listaFrecuenciaPagoAll;
    }
  }

  listaTiempos: TiempoContrato[] = [];

  listaModoMarcacion = [
    {
      nombre: 'Marcacion automatica',
      value: true,
    },
    {
      nombre: 'Marcacion manual',
      value: false,
    },
  ];

  tipoVerificacion: 'codigo' | 'foto' = 'foto';
  previewUrl: SafeUrl = '';
  isDiario: boolean = false;
  fotoCargada: boolean = false;

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const item = this.store.selectedItem();
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (error) {
      console.error('error', error);
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
          ? '¡Trabajador creado exitosamente!'
          : action === 'updated'
          ? '¡Trabajador actualizado exitosamente!'
          : '¡Roles creados exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && this.id !== item.id) {
      this.id = item.id;

      this.formData.get('trabajador')?.setValue({
        id: item.id,
        nombre: item.nombre,
        apellido: item.apellido,
        genero: item.genero,
        idPais: item.idPais,
        idTipoDocID: item.idTipoDocID,
        identificacion: item.identificacion,
        fechaNacimiento: item.fechaNacimiento,
        idEstadoCivil: item.idEstadoCivil,
        isActive: item.isActive,
      });

      this.formData.get('trabajador.identificacion')?.enable();

      if (item.contratos[0]) {
        this.formData.get('contrato')?.setValue({
          id: item.contratos[0]?.id,
          numNomina: item.contratos[0]?.numNomina,
          fechaContrato: item.contratos[0]?.fechaContrato
            ? new Date(item.contratos[0]?.fechaContrato)
            : undefined,
          fechaInicio: item.contratos[0]?.fechaInicio
            ? new Date(item.contratos[0]?.fechaInicio)
            : undefined,
          horasContrato: item.contratos[0]?.horasContrato,
          idCargo: item.contratos[0]?.idCargo,
          idFrecuenciaPago: item.contratos[0]?.idFrecuenciaPago,
          idTiempoContrato: item.contratos[0]?.idTiempoContrato,
          salarioMensual: item.contratos[0]?.salarioMensual,
        });
        this.formData.get('contrato.idFrecuenciaPago')?.enable();
        this.formData.get('contrato.horasContrato')?.enable();
        this.formData.get('contrato.salarioMensual')?.enable();
        this.changeCargo(null);
      }

      if (item.biometricos[0]) {
        this.formData.get('biometrico')?.setValue({
          id: item.biometricos[0]?.id,
          codigo: item.biometricos[0]?.codigo,
        });
        if (!item.biometricos[0]?.codigo) {
          this.tipoVerificacion = 'foto';
          this.fotoCargada = true;
          this.previewUrl =
            `${this.baseUrl}${item.biometricos[0]?.urlFile}`.replace(
              '//uploads',
              '/uploads'
            );
        } else {
          this.tipoVerificacion = 'codigo';
        }
      }

      if (item.infos[0]) {
        this.formData.get('info')?.setValue({
          id: item.infos[0]?.id,
          idCiudad: item.infos[0]?.idCiudad,
          celular: item.infos[0]?.celular,
          correo: item.infos[0]?.correo,
          direccion: item.infos[0]?.direccion,
        });
        this.idRegion = item.infos[0]?.ciudad?.province?.idState;
        this.idProvincia = item.infos[0]?.ciudad?.idProvince;
      }

      if (item.contactos[0]) {
        this.formData.get('contacto')?.setValue({
          id: item.contactos[0]?.id,
          nombre: item.contactos[0]?.nombre,
          apellido: item.contactos[0]?.apellido,
          celular: item.contactos[0]?.celular,
          correo: item.contactos[0]?.correo,
          parentezco: item.contactos[0]?.parentezco,
        });
      }

      if (item.beneficios[0]) {
        this.formData.get('beneficio')?.setValue({
          id: item.beneficios[0]?.id,
          idFondoPensiones: item.beneficios[0]?.idFondoPensiones,
          idSeguroSalud: item.beneficios[0]?.idSeguroSalud,
          pagoFeriado: item.beneficios[0]?.pagoFeriado ?? 0,
          bonoAdicional: item.beneficios[0]?.bonoAdicional ?? 0,
          aplicaComision: item.beneficios[0]?.aplicaComision,
        });
      }

      if (item.controles[0]) {
        this.formData.get('control')?.setValue({
          id: item.controles[0]?.id,
          idTurnoTrabajo: item.controles[0]?.idTurnoTrabajo,
          marcacionAutomatica: item.controles[0]?.marcacionAutomatica,
        });
      }
    }
  });

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    this.cargarTipoDocIdent();
    this.cargarTiempoContrato();
    this.cargarFrecuenciaPago();
    this.cargarSeguroSalud();
    this.cargarFondosPensiones();
    this.cargarTurnos();
    this.cargarEstadoCivil();

    if (instance.data) {
      const data = instance.data;
      this.id = data['id'];
      this.precargar();
    } else {
      this.cargarPais();
    }
  }

  cargarEstadoCivil() {
    this.estadoCivilService.findAll().subscribe({
      next: (data) => {
        this.listaEstadoCivil = data;
      },
    });
  }

  cargarTipoDocIdent() {
    this.tipoDocStore.loadAll();
  }

  cargarTiempoContrato() {
    this.tiempoContratoService.findAll().subscribe({
      next: (data) => {
        this.listaTiempos = data;
      },
    });
  }

  cargarFrecuenciaPago() {
    this.frecuenciaPagoService.findAll().subscribe({
      next: (data) => {
        this.listaFrecuenciaPagoAll = data;
      },
    });
  }

  cargarSeguroSalud() {
    this.seguroService.findAll().subscribe({
      next: (data) => {
        this.listaSeguroSalud = data;
      },
    });
  }

  cargarFondosPensiones() {
    this.fondoPensionesService.findAll().subscribe({
      next: (data) => {
        this.listaFondosPensiones = data;
      },
    });
  }

  cargarTurnos() {
    this.turnoTrabajoService.findAll().subscribe({
      next: (data) => {
        this.listaTurnos = data;
      },
    });
  }

  precargar() {
    if (this.id) {
    }
  }

  private cargarPais() {
    this.nacionalidadService
      .getPaises()
      .pipe(
        mergeMap((data) => {
          this.listaPaises = data;
          this.paisDefault = this.listaPaises.find((p) => p.iso3 === 'PER');
          return this.paisDefault?.id
            ? this.nacionalidadService.getRegiones(this.paisDefault?.id)
            : of([]);
        })
      )
      .subscribe({
        next: (data) => {
          this.listaDepartamentos = data;
        },
      });
  }

  cargarProvincias(idDepartamento: string) {
    this.listaCiudades = [];
    this.nacionalidadService.getProvincias(idDepartamento).subscribe({
      next: (data) => {
        this.listaProvincias = data;
      },
    });
  }

  cargarCiudades(idProvincia: string) {
    this.nacionalidadService.getCiudades(idProvincia).subscribe({
      next: (data) => {
        this.listaCiudades = data;
      },
    });
  }

  selectTipoDocId(event: any) {
    this.formData.get('trabajador.identificacion')?.enable();
  }

  get fondo() {
    return this.listaFondosPensiones.find(
      (item) =>
        item.id === this.formData.get('beneficio.idFondoPensiones')?.value
    );
  }

  get showComision(): boolean {
    return this.fondo ? this.fondo?.serialNumber != 6 : false;
  }

  changeCargo(event: any) {
    this.formData.get('contrato.idFrecuenciaPago')?.enable();
    this.formData.get('contrato.horasContrato')?.enable();
    this.formData.get('contrato.salarioMensual')?.enable();
  }

  generarCodigo() {
    const codigo = generarCodigoNumerico();
    this.formData.get('biometrico.codigo')?.setValue(codigo);
  }

  onFileSelected(event: any): void {
    this.archivo = event.target.files[0];
    if (this.archivo) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
          );
        }
      };
      reader.readAsDataURL(this.archivo);
    }
  }

  get invalid(): boolean {
    return (
      this.formData.invalid ||
      (this.tipoVerificacion == 'codigo'
        ? !this.formData.get('biometrico.codigo')?.value
        : !this.previewUrl)
    );
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  get isActive(): boolean {
    return this.formData.get('trabajador.isActive')?.value as boolean;
  }

  guardar() {
    const formTrabajador = this.formData.get('trabajador')?.value!;
    const formBiometrico = this.formData.get('biometrico')?.value;
    const formContrato = this.formData.get('contrato')?.value;
    const formInfo = this.formData.get('info')?.value;
    const formContacto = this.formData.get('contacto')?.value;
    const formBeneficio = this.formData.get('beneficio')?.value;
    const formControl = this.formData.get('control')?.value;

    if (this.id) {
      this.store.update(
        this.id,
        {
          ...(formTrabajador as Trabajador),
          contratos: [formContrato as ContratoTrabajador],
          controles: [formControl as ControlTrabajador],
          biometricos: [formBiometrico as RegistroBiometrico],
          infos: [formInfo as InfoTrabajador],
          contactos: [formContacto as ContactoTrabajador],
          beneficios: [
            {
              ...formBeneficio,
              bonoAdicional: formBeneficio?.bonoAdicional ?? 0,
              aplicaComision: this.showComision
                ? formBeneficio?.aplicaComision
                : false,
            } as BeneficioTrabajador,
          ],
        },
        { file: this.archivo }
      );
    } else {
      this.store.create(
        {
          ...formTrabajador,
          id: undefined,
          contratos: [{ ...formContrato, id: undefined } as ContratoTrabajador],
          controles: [{ ...formControl, id: undefined } as ControlTrabajador],
          biometricos: [
            {
              ...formBiometrico,
              id: undefined,
            } as RegistroBiometrico,
          ],
          infos: [{ ...formInfo, id: undefined } as InfoTrabajador],
          contactos: [{ ...formContacto, id: undefined } as ContactoTrabajador],
          beneficios: [
            {
              ...formBeneficio,
              id: undefined,
              bonoAdicional: formBeneficio?.bonoAdicional ?? 0,
              aplicaComision: this.showComision
                ? formBeneficio?.aplicaComision
                : false,
            } as BeneficioTrabajador,
          ],
        } as Trabajador,
        { file: this.archivo }
      );
    }
  }

  async exportarPlantillaExcel(): Promise<void> {
    const generarPlantillaDesdeFormGroup: any = (
      fg: FormGroup,
      parentKey: string = ''
    ) => {
      const ignorarGrupos = ['biometrico'];

      const result: any = {};

      for (const key in fg.controls) {
        if (ignorarGrupos.includes(key)) {
          continue; // Ignorar grupos completos
        }

        const control = fg.controls[key];
        let nombreCampo = key;

        // Renombrar si empieza con 'id'
        if (
          key.startsWith('id') &&
          key.length > 2 &&
          key[2] === key[2].toUpperCase()
        ) {
          nombreCampo = key.slice(2); // Elimina el "id"
        }

        const fullKey = parentKey ? `${parentKey}.${nombreCampo}` : nombreCampo;

        if (control instanceof FormGroup) {
          const sub = generarPlantillaDesdeFormGroup(
            control,
            fullKey,
            ignorarGrupos
          );
          Object.assign(result, sub);
        } else {
          // Ignorar "id" a secas (pero no idFondoX)
          if (
            ['id', 'isactive', 'marcacionautomatica'].includes(
              key.toLowerCase()
            )
          ) {
            continue;
          }

          result[fullKey] = '';
        }
      }

      return result;
    };

    const plantilla = generarPlantillaDesdeFormGroup(this.formData);
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');

    // Agregar encabezados (keys del objeto)
    const headers = Object.keys(plantilla);
    worksheet.addRow(headers);

    // Agregar los datos (valores del objeto)
    const dataRow = headers.map((key) => plantilla[key]);
    worksheet.addRow(dataRow);

    // Generar el buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Crear el Blob
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    fs.saveAs(blob, 'plantilla_trabajador.xlsx');
  }
}
