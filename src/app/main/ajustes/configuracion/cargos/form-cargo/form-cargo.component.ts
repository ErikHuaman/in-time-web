import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Cargo } from '@models/cargo.model';
import { MessageGlobalService } from '@services/message-global.service';
import { CargoStore } from '@stores/cargo.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-form-cargo',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    ToggleSwitchModule,
  ],
  templateUrl: './form-cargo.component.html',
  styles: ``,
})
export class FormCargoComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(CargoStore);

  formData = new FormGroup({
    nombre: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isActive: new FormControl<boolean>(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  id: string | undefined;

  get loading(): boolean {
    return this.store.loading();
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
          '¡Ups, ocurrió un error inesperado al guardar el cargo!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Cargo creado exitosamente!'
          : '¡Cargo actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && item.id != this.id) {
      console.log('Item seleccionado:', item);
      this.id = item.id ?? null;
      this.formData.setValue({
        nombre: item.nombre,

        isActive: item.isActive,
      });
    }
  });

  get isActive(): boolean {
    return this.formData.controls['isActive'].value;
  }

  guardar() {
    const { ...form } = this.formData.value;
    if (this.id) {
      this.store.update(this.id, { ...form, id: this.id } as Cargo);
    } else {
      this.store.create(form as Cargo);
    }
  }
}
