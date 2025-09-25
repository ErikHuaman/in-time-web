import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { sanitizedForm } from '@functions/forms.function';
import { Sede } from '@models/sede.model';
import { MessageGlobalService } from '@services/message-global.service';
import { SedeService } from '@services/sede.service';
import { SedeStore } from '@stores/sede.store';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-form-days-worked',
  imports: [
    CommonModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  templateUrl: './form-days-worked.component.html',
  styles: ``,
})
export class FormDaysWorkedComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  readonly store = inject(SedeStore);

  readonly service = inject(SedeService);

  diasTrab: number = 26;

  id: string | undefined;

  private resetOnSuccessEffect = effect(() => {
    const { selectedItem, error, lastAction } = this.store;

    const item = selectedItem();
    const action = lastAction();
    const currentError = error();

    // Manejo de errores
    if (currentError) {
      console.error('error', error);
      this.msg.error(
        currentError ??
          '¡Ups, ocurrió un error inesperado al guardar el edificio!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Edificio creado exitosamente!'
          : '¡Edificio actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && item.id != this.id) {
      this.id = item.id ?? null;
      this.diasTrab = item.diasTrab ?? 26;
    }
  });

  guardar() {
    if (this.id) {
      this.service
        .daysWorked(this.id, { diasTrab: this.diasTrab, id: this.id } as Sede)
        .subscribe({
          next: (data) => {
            this.msg.success(
              'Días laborados para el edificio actualizado exitosamente!'
            );

            this.store.clearSelected();
            this.ref.close(true);
          },
        });
    }
  }
}
