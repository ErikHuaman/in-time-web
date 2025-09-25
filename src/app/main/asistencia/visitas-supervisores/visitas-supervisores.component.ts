import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { AsistenciaUsuarioService } from '@services/asistencia-usuario.service';
import { SedeService } from '@services/sede.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { forkJoin, mergeMap } from 'rxjs';
import { DetalleVisitaComponent } from './detalle-visita/detalle-visita.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { SedeStore } from '@stores/sede.store';

@Component({
  selector: 'app-visitas-supervisores',
  imports: [
    CommonModule,
    ButtonModule,
    DatePickerModule,
    MultiSelectModule,
    FormsModule,
    InputIcon,
    IconField,
    InputTextModule,
    TableModule,
    TitleCardComponent,
    ButtonCustomComponent,
  ],
  templateUrl: './visitas-supervisores.component.html',
  styles: ``,
})
export class VisitasSupervisoresComponent implements OnInit {
  title: string = 'Visitas de supervisores';

  icon: string = 'material-symbols:supervised-user-circle-outline';

  private readonly dialogService = inject(DialogService);

  private readonly sedeStore = inject(SedeStore);

  private readonly asistenciaUsuarioService = inject(AsistenciaUsuarioService);

  fechaSelected!: Date;
  fechaSelectedPrev!: Date;

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  selectedSedes: string[] = [];

  private sedesEffect = effect(() => {
    const sedes = this.sedeStore.items();
    if (sedes) {
      this.selectedSedes = sedes.map((item) => item.id);
      this.filtrar();
    }
  });

  dataTable: any[] = [];
  listaVisitasMensual: any[] = [];

  ngOnInit(): void {
    this.fechaSelected = new Date();
    this.sedeStore.loadAll();
    this.cargarAsistencia();
  }

  cambiarFecha(event: Date) {
    if (this.fechaSelectedPrev?.getTime() !== this.fechaSelected?.getTime()) {
      this.cargarAsistencia();
    }
  }

  cargarAsistencia() {
    this.fechaSelectedPrev = this.fechaSelected;
    this.asistenciaUsuarioService.findAllByMonth(this.fechaSelected).subscribe({
      next: (data) => {
        this.listaVisitasMensual = data.map((d) => {
          d.fechaGroup = d.fecha.toString();
          d.usuario = {
            ...d.usuario,
            labelName: `${d.usuario?.nombre} ${d.usuario?.apellido}`,
          };
          return d;
        });
        this.filtrar();
      },
    });
  }

  filtrar(event?: number) {
    this.dataTable = this.listaVisitasMensual.filter((t) => {
      return this.selectedSedes.includes(t.dispositivo?.sede?.id);
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }

  verDetalle(item: any) {
    this.dialogService.open(DetalleVisitaComponent, {
      header: 'Detalle de visita',
      styleClass: 'modal-4xl',
      data: item,
      modal: true,
      dismissableMask: false,
      closable: true,
    });
  }
}
