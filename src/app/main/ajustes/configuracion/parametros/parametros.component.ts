import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ParametrosService } from '@services/parametros.service';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Parametro } from '@models/parametro.model';
import { SeguroSaludService } from '@services/seguro-salud.service';
import { FondoPensionesService } from '@services/fondo-pensiones.service';
import { forkJoin, map } from 'rxjs';
import { FondoPensiones } from '@models/fondo-pensiones.model';
import { MessageGlobalService } from '@services/message-global.service';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { SeguroSalud } from '@models/seguro-salud.model';

@Component({
  selector: 'app-parametros',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FieldsetModule,
    TableModule,
    InputTextModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    TitleCardComponent,
  ],
  templateUrl: './parametros.component.html',
  styles: ``,
})
export class ParametrosComponent implements OnInit {
  title: string = 'Parametros de pago';

  icon: string = 'material-symbols:document-search-outline-rounded';

  private readonly msg = inject(MessageGlobalService);

  private readonly parametrosService = inject(ParametrosService);

  private readonly seguroSaludService = inject(SeguroSaludService);

  private readonly fondoPensionesService = inject(FondoPensionesService);

  porcentaje?: number;

  formData = new FormGroup({
    parametro: new FormGroup({
      id: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      ruc: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      razonSocial: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      rubro: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      direccion: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      porcentaje25: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      porcentaje35: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
    fondoPensiones: new FormArray<FormGroup>([]),
    seguroSalud: new FormArray<FormGroup>([]),
  });

  get fondoPensiones(): FormArray {
    return this.formData.get('fondoPensiones') as FormArray;
  }

  get seguroSalud(): FormArray {
    return this.formData.get('seguroSalud') as FormArray;
  }

  ngOnInit(): void {
    this.precargar();
  }

  precargar() {
    this.cargarFondoPensiones();
    this.cargarSeguroSalud();
    this.cargarParametro();
  }

  cargarParametro() {
    this.parametrosService.findFirst().subscribe({
      next: (data) => {
        if (data) {
          this.formData.get('parametro')?.patchValue({
            id: data.id,
            ruc: data.ruc,
            razonSocial: data.razonSocial,
            rubro: data.rubro,
            direccion: data.direccion,
            porcentaje25: (data.porcentaje25 * 100)?.toFixed(2),
            porcentaje35: (data.porcentaje35 * 100).toFixed(2),
          });
        }
      },
    });
  }

  cargarFondoPensiones() {
    this.fondoPensionesService
      .findAll()
      .subscribe({
        next: (data: FondoPensiones[]) => {
          this.fondoPensiones.clear();
          data
            .filter((item) => item.orden != 0)
            .forEach((item) => {
              const form = new FormGroup({
                id: new FormControl<string | undefined>(item.id, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                orden: new FormControl<number>(item.orden, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                nombre: new FormControl<string | undefined>(item.nombre, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                esFijo: new FormControl<boolean>(item.esFijo, {
                  nonNullable: true,
                  validators: [Validators.required],
                }),
                pension: new FormControl<string | undefined>(
                  item.esFijo ? '0' : (item.pension * 100).toFixed(2),
                  {
                    nonNullable: true,
                    validators: item.esFijo ? [] : [Validators.required],
                  }
                ),
                seguro: new FormControl<string | undefined>(
                  (item.seguro * 100).toFixed(2),
                  {
                    nonNullable: true,
                    validators: [Validators.required],
                  }
                ),
                comision: new FormControl<string | undefined>(
                  item.esFijo ? '0' : (item.comision * 100).toFixed(2),
                  {
                    nonNullable: true,
                    validators: item.esFijo ? [] : [Validators.required],
                  }
                ),
              });
              this.fondoPensiones.push(form);
            });
        },
      });
  }

  cargarSeguroSalud() {
    this.seguroSaludService
      .findAll()
      .subscribe({
        next: (data: SeguroSalud[]) => {
          this.seguroSalud.clear();
          data.forEach((item) => {
            const form = new FormGroup({
              id: new FormControl<string | undefined>(item.id, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              orden: new FormControl<number>(item.orden, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              nombre: new FormControl<string | undefined>(item.nombre, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              esFijo: new FormControl<boolean>(item.esFijo, {
                nonNullable: true,
                validators: [Validators.required],
              }),
              valor: new FormControl<string | undefined>(
                item.esFijo
                  ? item.valor.toFixed(2)
                  : (item.valor * 100).toFixed(2),
                {
                  nonNullable: true,
                  validators: [Validators.required],
                }
              ),
            });
            this.seguroSalud.push(form);
          });
        },
      });
  }

  preventOverflow(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];

    const input = event.target as HTMLInputElement;
    const key = event.key;

    // Permitir teclas como backspace, tab, y las flechas para mover el cursor
    if (allowedKeys.includes(key)) return;

    // Solo permitir un punto decimal si aún no está presente
    if (key === '.' && input.value.includes('.')) {
      event.preventDefault();
      return;
    }

    // Solo permitir números y un punto decimal
    if (!/[\d.]/.test(key)) {
      event.preventDefault();
      return;
    }

    // Simulamos el valor después de la tecla presionada
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;

    const newValue =
      input.value.slice(0, selectionStart) +
      key +
      input.value.slice(selectionEnd);

    const numericValue = parseFloat(newValue);

    // Validar que el valor esté dentro del rango
    if (isNaN(numericValue) || numericValue > 100 || numericValue < 0.01) {
      event.preventDefault();
      return;
    }

    // Validar que no haya más de 2 decimales
    const parts = newValue.split('.');
    if (parts.length === 2 && parts[1].length > 2) {
      event.preventDefault();
      return;
    }
  }

  guardar() {
    const parametro = this.formData.get('parametro')?.value;
    const fondoPensiones: any[] =
      this.formData.get('fondoPensiones')?.value ?? [];
    const seguroSalud: any[] = this.formData.get('seguroSalud')?.value ?? [];

    forkJoin([
      this.parametrosService.update(
        parametro?.id as string,
        {
          ...parametro,
          porcentaje25: parseFloat(parametro?.porcentaje25 as string) / 100,
          porcentaje35: parseFloat(parametro?.porcentaje35 as string) / 100,
        } as Parametro
      ),
      this.fondoPensionesService.updateMany(
        fondoPensiones.map((item) => {
          return {
            ...item,
            pension: item.esFijo ? 0 : parseFloat(item.pension as string) / 100,
            seguro: parseFloat(item.seguro as string) / 100,
            comision: item.esFijo
              ? 0
              : parseFloat(item.comision as string) / 100,
          } as FondoPensiones;
        })
      ),
      this.seguroSaludService.updateMany(
        seguroSalud.map((item) => {
          return {
            ...item,
            valor: item.esFijo
              ? parseFloat(item.valor as string)
              : parseFloat(item.valor as string) / 100,
          };
        })
      ),
    ]).subscribe({
      next: (data) => {
        this.msg.success(
          'Los datos se guardaron correctamente en la base de datos.'
        );
        this.precargar();
      },
    });
  }
}
