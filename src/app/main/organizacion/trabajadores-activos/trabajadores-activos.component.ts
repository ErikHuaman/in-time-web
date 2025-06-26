import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormTrabajadorComponent } from './form-trabajador/form-trabajador.component';
import { Cargo } from '@models/cargo.model';
import { Trabajador } from '@models/trabajador.model';
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
})
export class TrabajadoresActivosComponent implements OnInit {
  title: string = 'Trabajadores activos';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly store = inject(TrabajadorStore);

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

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
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el equipo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('¡equipo eliminado exitosamente!');
      this.store.clearSelected();
      this.loadData();
      return;
    }
  });

  ngOnInit(): void {
    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.loadData();
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
    console.log('Filtrando trabajadores activos', this.listaTrabajadores);
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

  addNew() {
    this.store.clearSelected();
    this.openModal = true;
    const ref = this.dialogService.open(FormTrabajadorComponent, {
      header: 'Bitácora del trabajador',
      styleClass: 'modal-6xl',
      modal: true,
      dismissableMask: true,
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
      dismissableMask: true,
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
        // this.sedeService.delete(item.id).subscribe({
        //   next: (data) => {
        //     this.loadData();
        //   },
        // });
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
