import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Column, ExportColumn } from '@models/column-table.model';
import { Rol } from '@models/rol.model';
import { GrupoModuloService } from '@services/grupo-modulo.service';
import { MessageGlobalService } from '@services/message-global.service';
import { ModuloService } from '@services/modulo.service';
import { RolService } from '@services/rol.service';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { FormPermisosComponent } from '../form-permisos/form-permisos.component';
import { RolStore } from '@stores/rol.store';
import { ButtonEditComponent } from '@components/buttons/button-edit/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete/button-delete.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom/button-custom.component';
import { sanitizedForm } from '@functions/forms.function';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-form-permrolesisos',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    ToggleSwitchModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    ButtonEditComponent,
    ButtonDeleteComponent,
    ButtonCustomComponent,
  ],
  templateUrl: './form-roles.component.html',
  styles: ``,
})
export class FormRolesComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(RolStore);

  private readonly grupoModuloService = inject(GrupoModuloService);

  cols!: Column[];

  loadingTable?: boolean = false;

  exportColumns!: ExportColumn[];

  get listaRoles(): Rol[] {
    return this.store.items();
  }

  tipo: 'form' | 'table' = 'table';

  formData = new FormGroup({
    nombre: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    codigo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isActive: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id!: any;
  previewUrl: SafeUrl = '';

  get isActive(): boolean {
    return this.formData.controls['isActive'].value;
  }

  private resetOnSuccessEffect = effect(() => {
    const { selectedItem, error, lastAction } = this.store;

    const item = selectedItem();
    const action = lastAction();
    const currentError = error();

    // Manejo de errores
    if (currentError) {
      console.log('error', error);
      this.msg.error(
        currentError ??
          '¡Ups, ocurrió un error inesperado al guardar el rol!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? 'Rol creado exitosamente!'
          : 'Rol actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && item.id != this.id) {
      console.log('Item seleccionado:', item);
      this.id = item.id ?? null;
      this.formData.patchValue({
        nombre: item.nombre,
        codigo: item.codigo,
        isActive: item.isActive,
      });
    }
  });

    private getFileEffect = effect(() => {
    this.previewUrl = this.store.previewUrl();
  });

  ngOnInit(): void {
    this.cols = [
      {
        field: 'id',
        header: 'N°',
        align: 'center',
        widthClass: '!w-16',
      },
      { field: 'nombre', header: 'Nombre' },
      { field: 'codigo', header: 'Codigo' },
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
    this.cargarRoles();
    // this.cargarPermisoModulos();
  }

  cargarRoles() {
    this.store.loadAll();
  }

  cargarPermisoModulos() {
    this.grupoModuloService.findAllPermisos().subscribe({
      next: (data) => {
        console.log('data', data);
      },
    });
  }

  cancelar() {
    this.reset();
  }

  reset() {
    this.tipo = 'table';
    this.id = undefined;
    this.formData.patchValue({
      nombre: undefined,
      codigo: undefined,
      isActive: true,
    });
  }

  addNew() {
    this.tipo = 'form';
    // const ref = this.dialogService.open(FormUsuarioComponent, {
    //   header: 'Nuevo usuario',
    //   styleClass: 'modal-md',
    //   // position: 'center',
    //   modal: true,
    //   // dismissableMask: false,
    //   closable: true,
    // });
    // ref.onClose.subscribe((res) => {
    //   if (res) {
    //     this.cargarRoles();
    //   }
    // });
  }

  editar(item: Rol) {
    this.tipo = 'form';
    this.id = item.id;
    this.formData.patchValue({
      nombre: item.nombre,
      codigo: item.codigo,
      isActive: item.isActive,
    });
  }

  permisos(id: string) {
    const ref = this.dialogService.open(FormPermisosComponent, {
      header: 'Asignar permisos',
      styleClass: 'modal-6xl',
      modal: true,
      data: { id },
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarRoles();
      }
    });
  }

  // changeStatus(item: Rol) {
  //   this.msg.confirm(
  //     `¿Está seguro de ${item.isActive ? 'desactivar' : 'activar'} el usuario ${
  //       item.nombre
  //     }?`,
  //     () => {
  //       this.rolService.changeStatus(item.id, !item.isActive).subscribe({
  //         next: (data) => {
  //           this.cargarRoles();
  //         },
  //       });
  //     }
  //   );
  // }

  remove(item: Rol) {
    this.msg.confirm(
      `¿Está seguro de eliminar el rol ${item.nombre}? Esta acción no se puede deshacer.`,
      () => {
        this.store.delete(item.id!);
        this.msg.success('Rol eliminado correctamente');
        this.cancelar();
        this.cargarRoles();
      }
    );
  }

  guardar() {
    const form: Rol = sanitizedForm(this.formData.getRawValue());
    if (this.id) {
      this.store.update(this.id, { ...form, id: this.id });
      this.cargarRoles();
      this.cancelar();
    } else {
      this.store.create(form);
    }
  }
}
