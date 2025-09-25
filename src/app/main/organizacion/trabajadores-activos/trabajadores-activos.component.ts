import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
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
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { generarCodigoNumerico } from '@functions/number.function';
import { RegistroBiometrico } from '@models/registro-biometrico.model';
import { getDateExcel } from '@functions/fecha.function';
import { NacionalidadService } from '@services/nacionalidad.service';
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
import { AuthStore } from '@stores/auth.store';
import { Usuario } from '@models/usuario.model';
import { environment } from '@environments/environments';
import { Workbook } from 'exceljs';
import { BtnAddComponent } from '@components/buttons/btn-add.component';
import { TagsSedesComponent } from '@components/tags-sedes/tags-sedes.component';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { SkeletonTableDirective } from '@components/skeleton-table/skeleton-table.directive';
import { PaginatorDirective } from '@components/paginator/paginator.directive';
import { Column, ExportColumn } from '@models/column-table.model';

@Component({
  selector: 'app-trabajadores-activos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    SkeletonTableDirective,
    InputTextModule,
    ImageModule,
    SelectModule,
    FormsModule,
    TagsSedesComponent,
    TitleCardComponent,
    BtnAddComponent,
    BtnEditComponent,
    BtnDeleteComponent,
    PaginatorDirective,
  ],
  templateUrl: './trabajadores-activos.component.html',
  styles: ``,
})
export class TrabajadoresActivosComponent implements OnInit {
  readonly baseUrl: string = environment.urlBase;

  title: string = 'Trabajadores activos';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  readonly authStore = inject(AuthStore);

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

  get user(): Usuario {
    return this.authStore.user()!;
  }

  get isSuper(): boolean {
    return this.user.rol.codigo === 'super' && !environment.production;
  }

  get paisDefault(): Pais {
    return this.nacStore.pais()!;
  }
  listaPaises!: Pais[];

  listaSeguroSalud: SeguroSalud[] = [];
  listaFondosPensiones: FondoPensiones[] = [];
  listaTurnos: TurnoTrabajo[] = [];

  get listaTipoDocId(): TipoDocIdent[] {
    return this.tipoDocStore.items();
  }
  listaEstadoCivil: EstadoCivil[] = [];
  listaFrecuenciaPagoAll: FrecuenciaPago[] = [];

  listaTiempos: TiempoContrato[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  get dataTable(): Trabajador[] {
    return this.store.items().map((item) => {
      item.labelName = `${item.nombre} ${item.apellido}`;
      return item;
    });
  }

  openModal: boolean = false;

  limit = signal(12);
  offset = signal(0);
  totalItems = signal(0);
  loadingTable = signal(false);
  searchText = signal('');

  get listaCargos(): Cargo[] {
    return this.cargoStore
      .items()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  private resetOnSuccessEffect = effect(() => {
    this.loadingTable.set(this.store.loading());
    this.totalItems.set(this.store.totalItems());
    const error = this.store.error();
    const action = this.store.lastAction();

    // Manejo de errores
    if (!this.openModal && error) {
      console.error('error', error);
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

    // Si se ha creado o actualizado correctamente
    if (action === 'createMany') {
      this.msg.success('Datos importados correctamente.');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.cols = [
      {
        field: 'identificacion',
        header: 'Doc ID',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'labelName',
        header: 'Nombre completo',
        widthClass: '!min-w-72',
      },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'sedes', header: 'Edificios', align: 'center' },
      {
        field: 'biometrico',
        header: 'Registro biométrico',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: 'fechaInicio',
        header: 'Fecha de inicio',
        align: 'center',
        widthClass: '!w-42',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!min-w-32',
      },
    ];

    this.exportColumns = this.cols
      .filter((col) => col.field != '')
      .map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.loadData();
  }

  getImageUrl(url: string): string {
    return `${this.baseUrl}${url}`.replace('//uploads', '/uploads');
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
      sedes: this.selectedSedes,
      cargos: this.selectedCargos,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  clear() {
    this.selectedCargos = [];
    this.selectedSedes = [];
    this.searchText.set('');
    this.limit.set(12);
    this.offset.set(0);
    this.loadData();
  }

  onPageChange = ({ limit, offset }: { limit: number; offset: number }) => {
    this.limit.set(limit);
    this.offset.set(offset);
    this.search();
  };

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

  precargarCargaMasiva(fileImage: HTMLInputElement) {
    this.cargarPaises();
    this.cargarTipoDocIdent();
    this.cargarTiempoContrato();
    this.cargarFrecuenciaPago();
    this.cargarSeguroSalud();
    this.cargarFondosPensiones();
    this.cargarTurnos();
    this.cargarEstadoCivil();
    fileImage.click();
  }

  onExcelSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;
        const workbook = new Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0]; // Primera hoja
        const jsonData: any[] = [];

        // Obtener encabezados desde la primera fila
        const headerRow = worksheet.getRow(1);
        const headers = Array.isArray(headerRow.values)
          ? headerRow.values.slice(1) // Omite el primer elemento vacío
          : [];

        // Recorrer filas desde la segunda en adelante
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return; // Saltar encabezado

          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            const key = String(header); // Asegura que sea una clave válida
            rowData[key] = cell.value;
          });

          jsonData.push(rowData);
        });

        this.importarDatos(jsonData); // Tu función que maneja los datos importados
      };

      reader.readAsArrayBuffer(file); // Necesario para exceljs
    }
  }

  importarDatos(data: any[]) {
    if (data.length === 0) {
      this.msg.error('El archivo está vacío o no contiene datos válidos.');
      return;
    }

    const trabajadorData: Trabajador[] = data
      .filter(
        (item) =>
          item['trabajador.TipoDocID'] &&
          [
            'UGARTE & MOSCOSO',
            // 'RESIDENCIAL BRASIL',
            // 'OCEAN HOUSE',
            // 'TERRAZAS',
          ].includes(item['EDIFICIO'])
      )
      .map((item) => {
        const fecha = item['contrato.fechaInicio'];
        const isNaN = Number.isNaN(fecha);
        const utc_value_ini = !isNaN ? fecha : getDateExcel(fecha); // seconds in a day

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
              fechaContrato: new Date(!isNaN ? fecha : utc_value_ini * 1000),
              fechaInicio: new Date(!isNaN ? fecha : utc_value_ini * 1000),
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
                fechaAsignacion: new Date(
                  !isNaN ? fecha : utc_value_ini * 1000
                ),
              },
            },
          ],
        } as Trabajador;
      });

    this.store.createMany(trabajadorData);
  }
}
