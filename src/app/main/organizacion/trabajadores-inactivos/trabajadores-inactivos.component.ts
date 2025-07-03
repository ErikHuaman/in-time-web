import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormInactivarTrabajadorComponent } from './form-inactivar-trabajador/form-inactivar-trabajador.component';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { MessageGlobalService } from '@services/message-global.service';
import { CargoStore } from '@stores/cargo.store';
import { SedeStore } from '@stores/sede.store';
import { Trabajador } from '@models/trabajador.model';
import { Cargo } from '@models/cargo.model';
import { Sede } from '@models/sede.model';
import { TrabajadorInactivoStore } from '@stores/trabajador-inactivo.store';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom/button-custom.component';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-trabajadores-inactivos',
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TableModule,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonCustomComponent,
  ],
  templateUrl: './trabajadores-inactivos.component.html',
  styles: ``,
  providers: [DialogService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrabajadoresInactivosComponent implements OnInit {
  title: string = 'Trabajadores inactivos';

  icon: string = 'material-symbols:person-pin-outline-rounded';
  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly cargoStore = inject(CargoStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly store = inject(TrabajadorInactivoStore);

  selectedSedes: string[] = [];

  selectedCargos: string[] = [];

  get dataTable(): Trabajador[] {
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
    }
  });

  private cargosEffect = effect(() => {
    const cargos = this.cargoStore.items();
    if (cargos) {
      this.selectedCargos = cargos.map((item) => item.id);
    }
  });

  private resetOnSuccessEffect = effect(() => {
    const error = this.store.error();
    const action = this.store.lastAction();
    const items = this.store.items();

    // Manejo de errores
    if (!this.openModal && error) {
      console.log('error', error);
      this.msg.error(
        error ?? '¡Ups, ocurrió un error inesperado al eliminar el trabajador inactivo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'deleted') {
      this.msg.success('Trabajador activado exitosamente!');
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
      isActive: false,
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  search() {
    const q: Record<string, any> = {
      filter: false,
      isActive: false,
      search: this.searchText(),
    };
    this.store.loadAll(this.limit(), this.offset(), q);
  }

  onPageChange(event: { limit: number; offset: number }) {
    this.limit.set(event.limit);
    this.offset.set(event.offset);
    this.loadData();
  }

  addNew() {
    const ref = this.dialogService.open(FormInactivarTrabajadorComponent, {
      header: 'Inactivar trabajador',
      styleClass: 'modal-md',
      position: 'center',
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

  edit(id: string) {
    const ref = this.dialogService.open(FormInactivarTrabajadorComponent, {
      header: 'Inactivar trabajador',
      styleClass: 'modal-md',
      position: 'center',
      data: { id },
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

  reactivate(item: Trabajador) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
        <p class='text-center'> ¿Está seguro de reactivar al trabajador <span class='uppercase font-bold'>${item.nombre} ${item.apellido}</span>? </p>
      </div>`,
      () => {
        this.store.changeStatus(item.id!, true);
      }
    );
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
