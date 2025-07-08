import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
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
import { FormCorreccionMarcacionComponent } from './form-correccion-marcacion/form-correccion-marcacion.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { AsistenciaService } from '@services/asistencia.service';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';

@Component({
  selector: 'app-correccion-marcacion',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    SelectModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    InputIcon,
    IconField,
    SelectModule,
    TagModule,
    DatePickerModule,
    TooltipModule,
    TitleCardComponent,
  ],
  templateUrl: './correccion-marcacion.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CorreccionMarcacionComponent implements OnInit {
  title: string = 'Trabajadores con marcación incorrecta';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly sedeStore = inject(SedeStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly asistenciaService = inject(AsistenciaService);

  fechaSelected!: Date;
  fechaSelectedPrev!: Date;

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  get listaCargos(): Cargo[] {
    return this.cargoStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

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

  dataTable: any[] = [];

  listaAsistenciaMensual: any[] = [];

  ngOnInit(): void {
    this.fechaSelected = new Date();

    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.cargarAsistenciaObservada();
  }

  cargarAsistenciaObservada() {
    this.fechaSelectedPrev = this.fechaSelected;
    this.asistenciaService
      .findAllObservadoByMonth(this.fechaSelected)
      .subscribe({
        next: (data) => {
          this.listaAsistenciaMensual = data;
          this.filtrar();
        },
      });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaAsistenciaMensual.filter(
      (t) =>
        this.selectedSedes.includes(t.sede?.id) &&
        this.selectedCargos.includes(t.cargo?.id)
    );
  }

  cambiarFecha(event: Date) {
    if (this.fechaSelectedPrev?.getTime() !== this.fechaSelected?.getTime()) {
      this.cargarAsistenciaObservada();
    }
  }

  editar(item: any) {
    const ref = this.dialogService.open(FormCorreccionMarcacionComponent, {
      header: item.corrected
        ? 'Detalle de la corrección'
        : 'Corregir marcación',
      data: item,
      styleClass: 'modal-md',
      focusOnShow: false,
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarAsistenciaObservada();
      }
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
