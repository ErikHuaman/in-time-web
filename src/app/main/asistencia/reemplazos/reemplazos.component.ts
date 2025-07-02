import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { mergeMap } from 'rxjs';
import { ReemplazoHorarioService } from '@services/reemplazo-horario.service';
import { ReemplazoHorario } from '@models/reemplazo-horario.model';
import { FormReemplazoComponent } from './form-reemplazo/form-reemplazo.component';
import { MessageGlobalService } from '@services/message-global.service';
import { TabsModule } from 'primeng/tabs';
import { FormAsignarReemplazoComponent } from './form-asignar-reemplazo/form-asignar-reemplazo.component';
import { ReemplaceroService } from '@services/reemplacero.service';
import { Reemplacero } from '@models/reemplacero.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';

@Component({
  selector: 'app-reemplazos',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    SelectModule,
    TagModule,
    DatePickerModule,
    TooltipModule,
    MultiSelectModule,
    SkeletonModule,
    TabsModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './reemplazos.component.html',
  styles: ``,
  providers: [DialogService],
})
export class ReemplazosComponent implements OnInit {
  title: string = 'Reemplazos';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly sedeService = inject(SedeService);

  private readonly cargoService = inject(CargoService);

  private readonly reemplazoHorarioService = inject(ReemplazoHorarioService);

  private readonly reemplaceroService = inject(ReemplaceroService);

  fechaSelected: Date | undefined = new Date('2025/03/01');

  listaSedes: Sede[] = [];

  selectedSedes: string[] = [];

  listaCargos: Cargo[] = [];

  selectedCargos: string[] = [];

  listaReemplaceros: Reemplacero[] = [];

  listaReemplazo: ReemplazoHorario[] = [];

  dataTable: ReemplazoHorario[] = [];

  cols!: Column[];

  colsReemplaceros!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'Cargo ID',
        align: 'center',
      },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      {
        field: 'trabajador',
        header: 'Reemplazado por',
        align: 'center',
      },
      { field: 'pago', header: 'Pago diario', align: 'center' },
      { field: 'nota', header: 'Nota' },
      { field: 'fechaInicio', header: 'Fecha de inicio', align: 'center' },
      { field: 'fechaFin', header: 'Fecha de fin', align: 'center' },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!w-36',
      },
    ];

    this.colsReemplaceros = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'Cargo ID',
        align: 'center',
        widthClass: 'w-20',
      },
      { field: 'dni', header: 'DNI', align: 'center', widthClass: '!w-48' },
      { field: 'nombres', header: 'Nombres', align: 'start' },
      {
        field: 'codigo',
        header: 'Codigo',
        align: 'center',
      },
      {
        field: 'isActive',
        header: 'Estado',
        align: 'center',
        widthClass: '!w-28',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!w-36',
      },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));
    this.cargarSedes();
    this.cargarCargos();
    this.cargarReemplazos();
    this.cargarReemplaceros();
  }

  cargarSedes() {
    this.sedeService.findAll().subscribe({
      next: (data) => {
        this.listaSedes = data;
        this.listaSedes.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.selectedSedes = this.listaSedes.map((item) => item.id);
      },
    });
  }

  cargarCargos() {
    this.cargoService.findAll().subscribe({
      next: (data) => {
        this.listaCargos = data;
        this.selectedCargos = this.listaCargos.map((item) => item.id);
      },
    });
  }

  cargarReemplazos() {
    this.loadingTable = true;
    this.reemplazoHorarioService.findAll().subscribe({
      next: (data) => {
        this.loadingTable = false;
        this.listaReemplazo = data;
        this.filtrar();
      },
    });
  }

  cargarReemplaceros() {
    this.loadingTable = true;
    this.reemplaceroService.findAll().subscribe({
      next: (data) => {
        this.listaReemplaceros = data;
      },
    });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaReemplazo; /* .filter(
      (t) =>
        this.selectedSedes.includes(t.id as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    ); */
  }

  addNew() {
    const ref = this.dialogService.open(FormAsignarReemplazoComponent, {
      header: 'Asignar reemplazo',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarReemplazos();
      }
    });
  }

  editar(item: ReemplazoHorario) {
    const ref = this.dialogService.open(FormAsignarReemplazoComponent, {
      header: 'Modificar reemplazo',
      styleClass: 'modal-md',
      data: item,
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarReemplazos();
      }
    });
  }

  changeStatus(item: Sede) {
    this.msg.confirm(
      `¿Está seguro de ${
        item.isActive ? 'desactivar' : 'activar'
      } el edificio ${item.nombre}?`,
      () => {
        // this.sedeService.changeStatus(item.id, !item.isActive).subscribe({
        //   next: (data) => {
        //     this.cargarSedes();
        //   },
        // });
      }
    );
  }

  eliminar(item: Sede) {
    this.msg.confirm(
      `¿Está seguro de eliminar el edificio ${item.nombre}? Esta acción no se puede deshacer.`,
      () => {
        this.sedeService.delete(item.id).subscribe({
          next: (data) => {
            this.cargarSedes();
          },
        });
      }
    );
  }

  nuevoReemplazo() {
    const ref = this.dialogService.open(FormReemplazoComponent, {
      header: 'Nuevo reemplazero',
      styleClass: 'modal-sm',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarReemplaceros();
      }
    });
  }

  editarReemplazo(item: Reemplacero) {
    const ref = this.dialogService.open(FormReemplazoComponent, {
      header: 'Modificar reemplazero',
      styleClass: 'modal-sm',
      data: item,
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarReemplaceros();
      }
    });
  }

  changeStatusReemplazo(item: Reemplacero) {
    this.msg.confirm(
      `¿Está seguro de ${
        item.isActive ? 'desactivar' : 'activar'
      } el edificio ${item.nombres}?`,
      () => {
        // this.sedeService
        //   .changeStatus(item.id as string, !item.isActive)
        //   .subscribe({
        //     next: (data) => {
        //       this.cargarSedes();
        //     },
        //   });
      }
    );
  }

  eliminarReemplazo(item: Sede) {
    this.msg.confirm(
      `¿Está seguro de eliminar el edificio ${item.nombre}? Esta acción no se puede deshacer.`,
      () => {
        this.sedeService.delete(item.id).subscribe({
          next: (data) => {
            this.cargarSedes();
          },
        });
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
