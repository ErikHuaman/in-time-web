import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { sanitizedForm } from '@functions/forms.function';
import { Feriado } from '@models/feriado.model';
import { FeriadoService } from '@services/feriado.service';
import { MessageGlobalService } from '@services/message-global.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-form-evento',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule,
    CheckboxModule,
  ],
  templateUrl: './form-evento.component.html',
  styles: ``,
})
export class FormEventoComponent {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly feriadoService = inject(FeriadoService);

  private readonly msg = inject(MessageGlobalService);

  id!: string;

  formData = new FormGroup({
    title: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    start: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    end: new FormControl<Date | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    recurrente: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  guardar() {
    const form = sanitizedForm(this.formData.getRawValue());
    if (!this.id) {
      this.feriadoService.create(form as Feriado).subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.feriadoService.update(this.id, form as Feriado).subscribe({
        next: (data) => {
          this.msg.success('¡Actualizado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    }
  }
}
