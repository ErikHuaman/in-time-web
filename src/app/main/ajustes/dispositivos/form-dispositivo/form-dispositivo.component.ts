import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Dispositivo } from '@models/dispositivo.model';
import { Sede } from '@models/sede.model';
import { DispositivoService } from '@services/dispositivo.service';
import { MessageGlobalService } from '@services/message-global.service';
import { SedeService } from '@services/sede.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-form-dispositivo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ToggleSwitchModule
  ],
  templateUrl: './form-dispositivo.component.html',
  styles: ``,
})
export class FormDispositivoComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly dispositivoService = inject(DispositivoService);

  private readonly sedeService = inject(SedeService);

  private readonly msg = inject(MessageGlobalService);

  id!: string;

  listaSedes: Sede[] = [];

  formData = new FormGroup({
    nombre: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    codigo: new FormControl<string | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    idSede: new FormControl<string | undefined>(undefined, {
      nonNullable: false,
    }),
    isActive: new FormControl<boolean>(true, {
      nonNullable: false,
    }),
  });

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    const data = instance.data;

    if (data) {
      this.id = data.id;
      this.getDispositivo(this.id);
    }
    this.cargarSedes();
  }

  cargarSedes() {
    this.sedeService.findAll().subscribe((data) => {
      this.listaSedes = data;
    });
  }

  getDispositivo(id: string) {
    this.dispositivoService.findOne(id).subscribe({
      next: (data) => {
        this.formData.get('nombre')?.setValue(data.nombre);
        this.formData.get('codigo')?.setValue(data.codigo);
        this.formData.get('idSede')?.setValue(data.id);
        this.formData.get('isActive')?.setValue(data.isActive);
      },
    });
  }

  get isActive(): boolean {
    return this.formData.get('isActive')?.value as boolean;
  }

  guardar() {
    const form = this.formData.value;
    if (!this.id) {
      this.dispositivoService.create(form as Dispositivo).subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          this.msg.error(e.error.message);
        },
      });
    } else {
      this.dispositivoService.update(this.id, form as Dispositivo).subscribe({
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
