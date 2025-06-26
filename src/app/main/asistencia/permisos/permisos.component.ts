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
import { FormPermisoComponent } from './form-permiso/form-permiso.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { TrabajadorService } from '@services/trabajador.service';
import { mergeMap } from 'rxjs';
import { Column, ExportColumn } from '@models/column-table.model';
import { Trabajador } from '@models/trabajador.model';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';
import { PermisoTrabajadorService } from '@services/permiso-trabajador.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';

@Component({
  selector: 'app-permisos',
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
    TitleCardComponent,
  ],
  templateUrl: './permisos.component.html',
  styles: ``,
  providers: [DialogService],
})
export class PermisosComponent implements OnInit {
  title: string = 'Permisos';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly sedeService = inject(SedeService);

  private readonly cargoService = inject(CargoService);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly permisoService = inject(PermisoTrabajadorService);

  fechaSelected: Date | undefined = new Date('2025/03/01');

  listaSedes: Sede[] = [];

  selectedSedes: string[] = [];

  listaCargos: Cargo[] = [];

  selectedCargos: string[] = [];

  listaPermisos: PermisoTrabajador[] = [];

  dataTable: PermisoTrabajador[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'Permiso ID',
        align: 'center',
        widthClass: '!w-20',
      },
      { field: 'sede', header: 'Sede', align: 'center' },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'nota', header: 'Nota', align: 'center' },
      { field: 'fechaInicio', header: 'Fecha inicio', align: 'center' },
      { field: 'fechaFin', header: 'Fecha fin', align: 'center' },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.cargarPermisos();
  }

  cargarPermisos() {
    this.loadingTable = true;
    this.cargoService
      .findAll()
      .pipe(
        mergeMap((data) => {
          this.listaCargos = data;
          this.selectedCargos = this.listaCargos.map((item) => item.id);
          return this.sedeService.findAll();
        }),
        mergeMap((data) => {
          this.listaSedes = data;
          this.selectedSedes = this.listaSedes.map((item) => item.id);
          return this.permisoService.findAll();
        })
      )
      .subscribe({
        next: (data) => {
          this.loadingTable = false;
          this.listaPermisos = data;
          this.filtrar();
        },
      });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaPermisos.filter(
      (t) =>
        this.selectedSedes.includes(t.id as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    );
  }

  addNew() {
    const ref = this.dialogService.open(FormPermisoComponent, {
      header: 'Nuevo permiso',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarPermisos();
      }
    });
  }

  edit(item: any) {
    const ref = this.dialogService.open(FormPermisoComponent, {
      header: 'Modificar permiso',
      styleClass: 'modal-md',
      position: 'top',
      data: item,
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarPermisos();
      }
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
