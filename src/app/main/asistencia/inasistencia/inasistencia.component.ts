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
import { FormInasistenciaComponent } from './form-inasistencia/form-inasistencia.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { AsistenciaService } from '@services/asistencia.service';
import { SedeService } from '@services/sede.service';
import { CargoService } from '@services/cargo.service';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { Column, ExportColumn } from '@models/column-table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { forkJoin, mergeMap } from 'rxjs';
import { TitleCardComponent } from '@components/title-card/title-card.component';

@Component({
  selector: 'app-inasistencia',
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
    TagModule,
    DatePickerModule,
    TooltipModule,
    SkeletonModule,
    TitleCardComponent
  ],
  templateUrl: './inasistencia.component.html',
  styles: ``,
  providers: [DialogService],
})
export class InasistenciaComponent implements OnInit {
  title: string = 'Inasistencia';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly sedeService = inject(SedeService);

  private readonly cargoService = inject(CargoService);

  private readonly asistenciaService = inject(AsistenciaService);

  fechaSelected!: Date;

  listaSedes: Sede[] = [];

  selectedSedes: string[] = [];

  listaCargos: Cargo[] = [];

  selectedCargos: string[] = [];

  dataTable: any[] = [];

  cols!: Column[];

  exportColumns!: ExportColumn[];

  loadingTable?: boolean = false;

  listaAsistenciaMensual: any[] = [];

  ngOnInit(): void {
    this.fechaSelected = new Date('2025/04/01');

    this.cols = [
      { field: 'fecha', header: 'Fecha', align: 'center', widthClass: '!w-36' },
      { field: 'nombre', header: 'nombre' },
      { field: 'apellido', header: 'apellido' },
      { field: 'sede', header: 'sede' },
      { field: 'cargo', header: 'cargo' },
      { field: 'nota', header: 'Nota' },
      {
        field: 'isActive',
        header: 'Estado',
        align: 'center',
        widthClass: '!w-40',
      },
      {
        field: '',
        header: 'Acciones',
        align: 'center',
        widthClass: '!w-28',
      },
    ];

    this.exportColumns = this.cols
      .filter((col) => col.field != '')
      .map((col) => ({
        title: col.header,
        dataKey: col.field,
      }));

    this.cargarInasistencia();
  }

  filtrar(event?: number) {
    this.dataTable = this.listaAsistenciaMensual.filter(
      (t) =>
        this.selectedSedes.includes(t.sede.id) &&
        this.selectedCargos.includes(t.cargo.id)
    );
  }

  cambiarFecha(event: Date) {
    this.cargarInasistencia();
  }

  cargarInasistencia() {
    this.loadingTable = true;
    forkJoin([/* this.sedeService.findAll(), this.cargoService.findAll() */])
      .pipe(
        mergeMap((arr) => {
          /* this.listaSedes = arr[0];
          this.selectedSedes = this.listaSedes.map((item) => item.id); */
          // this.listaCargos = arr[1];
          // this.selectedCargos = this.listaCargos.map((item) => item.id);
          return this.asistenciaService.findAllInasistenciaByMonth(
            this.fechaSelected
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.loadingTable = false;
          this.listaAsistenciaMensual = data;
          this.filtrar();
        },
      });
  }

  edit(item: any) {
    const ref = this.dialogService.open(FormInasistenciaComponent, {
      header: 'Justificación de inasistencia',
      styleClass: 'modal-md',
      data: item,
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarInasistencia();
      }
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
