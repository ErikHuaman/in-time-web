import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
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
import { ButtonEditComponent } from '@components/buttons/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete.component';
import { ButtonCustomComponent } from '@components/buttons/button-custom.component';
import { sanitizedForm } from '@functions/forms.function';
import { SafeUrl } from '@angular/platform-browser';
import { environment } from '@environments/environments';

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
  ],
  templateUrl: './form-roles.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormRolesComponent implements OnInit {
  readonly baseUrl: string = environment.urlBase;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly store = inject(RolStore);

  private readonly grupoModuloService = inject(GrupoModuloService);

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
      console.error('error', error);
      this.msg.error(
        currentError ?? '¡Ups, ocurrió un error inesperado al guardar el rol!'
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
      this.id = item.id ?? null;
      this.formData.patchValue({
        nombre: item.nombre,
        codigo: item.codigo,
        isActive: item.isActive,
      });
    }
  });

  ngOnInit(): void {}

  cargarPermisoModulos() {
    this.grupoModuloService.findAllPermisos().subscribe({
      next: (data) => {},
    });
  }

  remove(item: Rol) {
    this.msg.confirm(
      `¿Está seguro de eliminar el rol ${item.nombre}? Esta acción no se puede deshacer.`,
      () => {
        this.store.delete(item.id!);
      }
    );
  }

  guardar() {
    const form: Rol = sanitizedForm(this.formData.getRawValue());
    if (this.id) {
      this.store.update(this.id, { ...form, id: this.id });
    } else {
      this.store.create(form);
    }
  }
}
