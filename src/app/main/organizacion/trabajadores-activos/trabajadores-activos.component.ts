import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormTrabajadorComponent } from './form-trabajador/form-trabajador.component';
import { Cargo } from '@models/cargo.model';
import {
  BeneficioTrabajador,
  ContactoTrabajador,
  ContratoTrabajador,
  ControlTrabajador,
  InfoTrabajador,
  Trabajador,
} from '@models/trabajador.model';
import { Sede } from '@models/sede.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TrabajadorStore } from '@stores/trabajador.store';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroup } from 'primeng/inputgroup';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorComponent } from '@components/paginator/paginator.component';
import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { generarCodigoNumerico } from '@functions/number.function';
import { RegistroBiometrico } from '@models/registro-biometrico.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getDateExcel } from '@functions/fecha.function';
import { NacionalidadService } from '@services/nacionalidad.service';
import { mergeMap } from 'rxjs';
import { Pais } from '@models/nacionalidad.model';
import { NacionalidadStore } from '@stores/nacionalidad.store';
import { TurnoTrabajoService } from '@services/turno-trabajo.service';
import { TipoDocIdentStore } from '@stores/tipo-doc-ident.store';
import { FrecuenciaPagoService } from '@services/frecuencia-pago.service';
import { TiempoContratoService } from '@services/tiempo-contrato.service';
import { EstadoCivilService } from '@services/estado-civil.service';
import { SeguroSaludService } from '@services/seguro-salud.service';
import { FondoPensionesService } from '@services/fondo-pensiones.service';
import { SeguroSalud } from '@models/seguro-salud.model';
import { FondoPensiones } from '@models/fondo-pensiones.model';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';
import { EstadoCivil } from '@models/estado-civil.model';
import { FrecuenciaPago } from '@models/frecuencia-pago.model';
import { TiempoContrato } from '@models/tiempo-contrato.model';
import { TurnoTrabajo } from '@models/turno-trabajo.model';

@Component({
  selector: 'app-trabajadores-activos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    InputGroup,
    InputGroupAddonModule,
    TooltipModule,
    ChipModule,
    PopoverModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
    PaginatorComponent,
  ],
  templateUrl: './trabajadores-activos.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrabajadoresActivosComponent implements OnInit {
  title: string = 'Trabajadores activos';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(TrabajadorStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  readonly nacStore = inject(NacionalidadStore);

  private readonly nacionalidadService = inject(NacionalidadService);

  private readonly turnoTrabajoService = inject(TurnoTrabajoService);

  private readonly tipoDocStore = inject(TipoDocIdentStore);

  private readonly frecuenciaPagoService = inject(FrecuenciaPagoService);

  private readonly tiempoContratoService = inject(TiempoContratoService);

  private readonly estadoCivilService = inject(EstadoCivilService);

  private readonly seguroService = inject(SeguroSaludService);

  private readonly fondoPensionesService = inject(FondoPensionesService);

  get paisDefault(): Pais {
    return this.nacStore.pais()!;
  }
  listaPaises!: Pais[];

  listaGeneros = ['FEMENINO', 'MASCULINO'];
  listaSeguroSalud: SeguroSalud[] = [];
  listaFondosPensiones: FondoPensiones[] = [];
  listaTurnos: TurnoTrabajo[] = [];

  get listaTipoDocId(): TipoDocIdent[] {
    return this.tipoDocStore.items();
  }
  listaEstadoCivil: EstadoCivil[] = [];
  listaFrecuenciaPagoAll: FrecuenciaPago[] = [];

  listaTiempos: TiempoContrato[] = [];

  get listaTrabajadores(): Trabajador[] {
    return this.store.items();
  }

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  searchText = signal('');

  get loadingTable(): boolean {
    return this.store.loading();
  }

  get totalItems(): number {
    return this.store.totalItems();
  }

  dataTable: Trabajador[] = [];

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore.items();
  }

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  private sedesEffect = effect(() => {
    const sedes = this.sedeStore.items();
    if (sedes) {
      this.selectedSedes = sedes.map((item) => item.id);
      this.filtrar();
    }
  });

  private cargosEffect = effect(() => {
    const cargos = this.cargoStore.items();
    if (cargos) {
      this.selectedCargos = cargos.map((item) => item.id);

      this.filtrar();
    }
  });

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();
    const items = this.store.items();

    if (items) {
      this.filtrar();
    }

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el trabajador!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Trabajador eliminado exitosamente!');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.loadData();

    this.cargarPaises();
    this.cargarTipoDocIdent();
    this.cargarTiempoContrato();
    this.cargarFrecuenciaPago();
    this.cargarSeguroSalud();
    this.cargarFondosPensiones();
    this.cargarTurnos();
    this.cargarEstadoCivil();
  }

  loadData() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  search() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
      search: this.searchText(),
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  filtrar(event?: number) {
    this.listaSedes.sort((a, b) => a.nombre.localeCompare(b.nombre));

    this.dataTable = this.listaTrabajadores.filter(
      (t) =>
        (t.sedes?.length == 0 ||
          t.sedes?.filter((a) => this.selectedSedes.includes(a.id)).length !=
            0 ||
          this.selectedSedes.length == this.listaSedes.length ||
          this.selectedSedes.length == 0) &&
        (t.contratos ?? [])[0]?.idCargo &&
        this.selectedCargos.includes((t.contratos ?? [])[0]?.idCargo!)
    );
  }

  private cargarPaises() {
    this.nacionalidadService.getPaises().subscribe({
      next: (data) => {
        this.listaPaises = data;
      },
    });
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

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormTrabajadorComponent, {
      header: 'Bitácora del trabajador',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  edit(item: Trabajador) {
    this.store.loadById(item.id!);
    this.openModal = true;
    const ref = this.dialogService.open(FormTrabajadorComponent, {
      header: 'Bitácora del trabajador',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      this.openModal = false;
      if (res) {
        this.loadData();
      }
    });
  }

  remove(item: Trabajador) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de eliminar el trabajador <span class='uppercase font-bold'>${item.nombre}</span>? </p>
        <p class='text-center'> Esta acción no se puede deshacer. </p>
      </div>`,
      () => {
        this.store.delete(item.id!);
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
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
