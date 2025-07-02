import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
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

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TrabajadorStore } from '@stores/trabajador.store';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { Sede } from '@models/sede.model';
import { TipoDocIdentStore } from '@stores/tipo-doc-ident.store';
import { getDateExcel } from '@functions/fecha.function';

@Component({
  selector: 'app-form-trabajador',
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
    ToggleSwitchModule,
    RadioButtonModule,
    InputOtpModule,
  ],
  templateUrl: './form-trabajador.component.html',
  styles: ``,
})
export class FormTrabajadorComponent implements OnInit {
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
        validators: [Validators.required],
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
      idFondoPensiones: new FormControl<string | undefined>(undefined),
      idSeguroSalud: new FormControl<string | undefined>(undefined),
      pagoFeriado: new FormControl<number | undefined>(undefined),
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

  listaSeguroSalud: SeguroSalud[] = [];
  listaFondosPensiones: FondoPensiones[] = [];
  id?: string;

  listaGeneros = ['FEMENINO', 'MASCULINO'];

  get listaTipoDocId(): TipoDocIdent[] {
    return this.tipoDocStore.items();
  }
  listaEstadoCivil: EstadoCivil[] = [];
  listaFrecuenciaPagoAll: FrecuenciaPago[] = [];
  listaFrecuenciaPago: FrecuenciaPago[] = [];

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

  private getFileEffect = effect(() => {
    this.previewUrl = this.store.previewUrl();
  });

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
          this.getArchivoBiometrico(item.biometricos[0]?.id!);
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
          pagoFeriado: item.beneficios[0]?.pagoFeriado,
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

  getArchivoBiometrico(id: string) {
    this.store.getFile(id);
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

  changeCargo(event: any) {
    if (
      this.listaCargos.find(
        (item) => item.id === this.formData.get('contrato.idCargo')?.value
      )?.isDescansero
    ) {
      this.listaFrecuenciaPago = this.listaFrecuenciaPagoAll.filter(
        (item) => item.orden == 1
      );
      this.isDiario = true;
    } else {
      this.listaFrecuenciaPago = this.listaFrecuenciaPagoAll;
      this.isDiario = false;
    }
    this.formData.get('contrato.idFrecuenciaPago')?.enable();
    this.formData.get('contrato.horasContrato')?.enable();
    this.formData.get('contrato.salarioMensual')?.enable();
  }

  changeTipo(event: any) {
    this.formData.get('biometrico.codigo')?.setValue(undefined);
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
          beneficios: [formBeneficio as BeneficioTrabajador],
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
            { ...formBeneficio, id: undefined } as BeneficioTrabajador,
          ],
        } as Trabajador,
        { file: this.archivo }
      );
    }
  }

  exportarPlantillaExcel(): void {
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
    const hoja: XLSX.WorkSheet = XLSX.utils.json_to_sheet([plantilla]);

    const libro: XLSX.WorkBook = {
      Sheets: { Plantilla: hoja },
      SheetNames: ['Plantilla'],
    };

    const excelBuffer: any = XLSX.write(libro, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, 'plantilla_trabajador.xlsx');
  }

  onExcelSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const data: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(data, {
          type: 'binary',
        });
        const firstSheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        this.importarDatos(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  }

  importarDatos(data: any[]) {
    if (data.length === 0) {
      this.msg.error('El archivo está vacío o no contiene datos válidos.');
      return;
    }

    const trabajadorData: Trabajador[] = data
      .filter((item) => item['trabajador.TipoDocID'])
      .map((item) => {
        const utc_value_ini = getDateExcel(item['contrato.fechaInicio']); // seconds in a day

        const idPais = this.listaPaises.find(
          (pais) =>
            pais.name.toLowerCase().trim() ===
            item['trabajador.Pais']?.toLowerCase().trim()
        )?.id;

        const idTipoDocID = this.listaTipoDocId.find(
          (a) =>
            a.nombre.toLowerCase().trim() ===
            item['trabajador.TipoDocID']?.toLowerCase().trim()
        )?.id;

        const idEstadoCivil = this.listaEstadoCivil.find((e) =>
          item['trabajador.EstadoCivil'] == 'C'
            ? e.nombre.toLowerCase().trim() === 'casado'
            : e.nombre.toLowerCase().trim() === 'soltero'
        )?.id;

        const idTurnoTrabajo = this.listaTurnos.find(
          (turno) =>
            turno.codigo.toLowerCase().trim() ===
            (item['control.TurnoTrabajo'] ?? 'TD')?.toLowerCase().trim()
        )?.id;

        const idFrecuenciaPago = this.listaFrecuenciaPagoAll.find(
          (f) =>
            f.nombre.toLowerCase().trim() ===
            item['contrato.FrecuenciaPago']?.toLowerCase().trim()
        )?.id;

        const idTiempoContrato = this.listaTiempos[4]?.id;

        const idFondoPensiones = this.listaFondosPensiones.find(
          (t) =>
            t.nombre.toLowerCase().trim() ===
            item['beneficio.FondoPensiones']?.toLowerCase().trim()
        )?.id;

        const idSeguroSalud = this.listaSeguroSalud.find(
          (t) =>
            t.nombre.toLowerCase().trim() ===
            item['beneficio.SeguroSalud']?.toLowerCase().trim()
        )?.id;

        const idCargo = this.listaCargos.find(
          (t) =>
            t.nombre.toLowerCase().trim() ===
            item['contrato.Cargo']?.toLowerCase().trim()
        )?.id;

        const idSede = this.listaSedes.find(
          (s) =>
            s.nombre.toLowerCase().trim() ===
            item['EDIFICIO']?.toLowerCase().trim()
        )?.id;

        return {
          nombre: item['trabajador.nombre'],
          apellido: item['trabajador.apellido'],
          genero: item['trabajador.genero'],
          idPais: idPais || this.paisDefault?.id,
          idTipoDocID: idTipoDocID,
          identificacion: item['trabajador.identificacion'],
          idEstadoCivil: idEstadoCivil,
          isActive: true,
          biometricos: [
            {
              codigo: generarCodigoNumerico(),
            } as RegistroBiometrico,
          ],
          controles: [
            {
              idTurnoTrabajo: idTurnoTrabajo,
              marcacionAutomatica: false,
            } as ControlTrabajador,
          ],
          contratos: [
            {
              idCargo: idCargo,
              numNomina: item['contrato.numNomina'] || undefined,
              fechaContrato: new Date(utc_value_ini * 1000),
              fechaInicio: new Date(utc_value_ini * 1000),
              idTiempoContrato: idTiempoContrato,
              idFrecuenciaPago: idFrecuenciaPago,
              horasContrato:
                parseFloat(
                  item['contrato.horasContrato'].replace(' HORAS', '')
                ) || undefined,
              salarioMensual:
                parseFloat(item['contrato.salarioMensual']) || undefined,
            } as ContratoTrabajador,
          ],
          infos: [
            {
              // idCiudad: item['info.idCiudad'],
              direccion: item['info.direccion'] || undefined,
              celular: item['info.celular'] || undefined,
              correo:
                item['info.correo'] !== 'NO REGISTRA'
                  ? item['info.correo']
                  : undefined,
            } as InfoTrabajador,
          ],
          contactos: [
            {
              nombre: item['contacto.nombre'] || undefined,
              apellido: item['contacto.apellido'] || undefined,
              parentezco: item['contacto.parentezco'] || undefined,
              celular: item['contacto.celular'] || undefined,
              correo: item['contacto.correo'] || undefined,
            } as ContactoTrabajador,
          ],
          beneficios: [
            {
              idFondoPensiones: idFondoPensiones,
              idSeguroSalud: idSeguroSalud,
              pagoFeriado:
                parseFloat(item['beneficio.pagoFeriado']) || undefined,
            } as BeneficioTrabajador,
          ],
          sedes: [
            {
              id: idSede,
              AsignacionSede: {
                fechaAsignacion: new Date(utc_value_ini * 1000),
              },
            },
          ],
        } as Trabajador;
      });

    this.store.createMany(trabajadorData);

    // Aquí puedes agregar lógica para manejar otros campos del formulario
    // como biometrico, contrato, info, contacto, beneficio, etc.

    this.msg.success('Datos importados correctamente.');
  }
}
