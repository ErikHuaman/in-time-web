import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormAdelantoComponent } from './form-adelanto/form-adelanto.component';
import { DatePickerModule } from 'primeng/datepicker';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { TrabajadorService } from '@services/trabajador.service';
import { mergeMap } from 'rxjs';
import { AdelantoService } from '@services/adelanto.service';
import { Trabajador } from '@models/trabajador.model';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { Adelanto } from '@models/adelanto.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { TitleCardComponent } from '@components/title-card/title-card.component';

@Component({
  selector: 'app-adelantos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    SkeletonModule,
    TitleCardComponent,
  ],
  templateUrl: './adelantos.component.html',
  styles: ``,
  providers: [DialogService],
})
export class AdelantosComponent implements OnInit {
  title: string = 'Adelantos de sueldo';

  icon: string = 'material-symbols:person-pin-outline-rounded';

  private readonly dialogService = inject(DialogService);

  private readonly sedeService = inject(SedeService);

  private readonly cargoService = inject(CargoService);

  private readonly trabajadorService = inject(TrabajadorService);

  private readonly adelantoService = inject(AdelantoService);

  fechaSelected: Date | undefined = new Date('2025/03/01');

  listaSedes: Sede[] = [];

  selectedSedes: string[] = [];

  listaCargos: Cargo[] = [];

  selectedCargos: string[] = [];

  listaTrabajadores: Trabajador[] = [];

  listaAdelantos: Adelanto[] = [];

  dataTable: Adelanto[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'ID',
        customExportHeader: 'PermisoTrabajador ID',
        align: 'center',
        widthClass: '!w-20',
      },
      { field: 'nombre', header: 'Nombre' },
      { field: 'apellido', header: 'Apellido' },
      { field: 'sede', header: 'Sede', align: 'center' },
      { field: 'cargo', header: 'Cargo', align: 'center' },
      { field: 'montoAdelanto', header: 'Monto adelantado', align: 'center' },
      {
        field: 'cuotasDescuento',
        header: 'Cuotas de descuento',
        align: 'center',
      },
      { field: 'fechaAdelanto', header: 'Fecha de adelanto', align: 'center' },
      {
        field: 'fechaDescuento',
        header: 'Fecha de descuento',
        align: 'center',
      },
    ];

    this.exportColumns = this.cols.map((col) => ({
      title: col.header,
      dataKey: col.field,
    }));

    this.cargarAdelantos();
  }

  cargarAdelantos() {
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
          return this.trabajadorService.findAllActivos();
        }),
        mergeMap((data) => {
          this.listaTrabajadores = data;
          return this.adelantoService.findAll();
        })
      )
      .subscribe({
        next: (data) => {
          this.loadingTable = false;
          this.listaAdelantos = data;
          this.filtrar();
        },
      });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaAdelantos.filter(
      (t) =>
        this.selectedSedes.includes(t.id as string) &&
        this.selectedCargos.includes(t.idCargo as string)
    );
  }

  addNew() {
    const ref = this.dialogService.open(FormAdelantoComponent, {
      header: 'Registrar adelanto de sueldo',
      styleClass: 'modal-md',
      position: 'top',
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarAdelantos();
      }
    });
  }

  edit(item: any) {
    const ref = this.dialogService.open(FormAdelantoComponent, {
      header: 'Inactivar trabajador',
      styleClass: 'modal-md',
      position: 'top',
      data: item,
      modal: true,
      dismissableMask: true,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarAdelantos();
      }
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
