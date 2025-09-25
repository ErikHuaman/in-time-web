import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Trabajador } from '@models/trabajador.model';
import { TurnoTrabajo } from '@models/turno-trabajo.model';
import { TurnoTrabajoService } from '@services/turno-trabajo.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { SelectHoraComponent } from './select-hora/select-hora.component';
import { BloqueHorasService } from '@services/bloque-horas.service';
import { BloqueHoras } from '@models/bloque-horas.model';
import { MenuItem } from 'primeng/api';
import { HorarioTrabajador } from '@models/horario-trabajador.model';
import { TipoTurnoService } from '@services/tipo-turno.service';
import { TipoTurno } from '@models/tipo-turno.model';
import { HorarioTrabajadorService } from '@services/horario-trabajador.service';
import { FormPatronComponent } from './form-patron/form-patron.component';
import { HorarioTrabajadorItem } from '@models/horario-trabajador-item.model';
import { PatronHorarioService } from '@services/patron-horario.service';
import { PatronHorario } from '@models/patron-horario.model';
import { MessageGlobalService } from '@services/message-global.service';
import { PatronHorarioItem } from '@models/patron-horario-item.model';
import { Sede } from '@models/sede.model';
import { TrabajadorStore } from '@stores/trabajador.store';
import { sanitizedForm } from '@functions/forms.function';
import { TipoPatronStore } from '@stores/tipo-patron.store';
import { TipoPatron } from '@models/tipo-patron.model';
import { SedeStore } from '@stores/sede.store';
import { CargoStore } from '@stores/cargo.store';
import { DatePickerModule } from 'primeng/datepicker';
import { getDiasDelMes } from '@functions/fecha.function';

@Component({
  selector: 'app-form-horario',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    FieldsetModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    ContextMenuModule,
    ContextMenu,
  ],
  templateUrl: './form-horario.component.html',
  styles: ``,
})
export class FormHorarioComponent implements OnInit {
  @ViewChild('cm') cm!: ContextMenu;

  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  public readonly msg = inject(MessageGlobalService);

  private readonly turnoTrabajoService = inject(TurnoTrabajoService);

  private readonly bloqueHorasService = inject(BloqueHorasService);

  private readonly trabajadorStore = inject(TrabajadorStore);

  private readonly tipoPatronStore = inject(TipoPatronStore);

  private readonly sedeStore = inject(SedeStore);

  private readonly cargoStore = inject(CargoStore);

  private readonly tipoTurnoService = inject(TipoTurnoService);

  private readonly patronHorarioService = inject(PatronHorarioService);

  private readonly horarioTrabajadorService = inject(HorarioTrabajadorService);

  itemsMenuContext: MenuItem[] = [];
  isMonth: boolean = false;

  monthSelected?: Date;
  nombreTrabajador?: string;

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore
      .items()
      .filter((item) => item.sedes.map((s) => s.id).includes(this.sedeSelected))
      .map((item) => {
        item.labelName = `${item.contratos[0]?.cargo?.nombre} | ${item.nombre} ${item.apellido} (${item.identificacion})`;
        return item;
      });
  }

  get listaSedesAll(): Sede[] {
    return this.sedeStore
      .items()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  sedeSelected!: string;

  listaSedes: Sede[] = [];

  get listaTipoPatrones(): TipoPatron[] {
    return this.tipoPatronStore.items();
  }

  listaHorarioTrabajadorItem: HorarioTrabajadorItem[][] = [];

  formData = new FormGroup({
    idTrabajador: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    horasDiarias: new FormControl<number | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    idTipoTurno: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    idTipoPatron: new FormControl<string | undefined>(
      { value: undefined, disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
  });

  id!: string;

  selectedBloque!: BloqueHoras;

  idPatronSelected?: string;

  listaTurnos: TurnoTrabajo[] = [];

  listaTipoTurno: TipoTurno[] = [];

  listaPatrones: PatronHorario[] = [];

  listaPatronesHorario: PatronHorario[] = [];

  selectedBloqueId!: string;
  listaBloqueHoras: BloqueHoras[] = [];
  preSelectedIndexes: number[] = [];

  ngOnInit(): void {
    this.sedeStore.loadAll();
    this.cargoStore.loadAll();
    this.tipoPatronStore.loadAll();
    const instance = this.dialogService.getInstance(this.ref);
    this.loadData();
    this.cargarTurnos();
    this.cargarTipoTurnos();
    this.cargarBloqueHoras();
    this.cargarPatronesHorario();
    const data: HorarioTrabajador = instance.data;
    if (data) {
      setTimeout(() => {
        this.id = data.id!;
        this.sedeSelected = data.trabajador?.sedes[0]?.id!;
        this.formData.patchValue({
          idTrabajador: data.idTrabajador!,
          idTipoPatron: data.idTipoPatron!,
        });
        this.selectTrabajador();
        this.monthSelected = new Date(data.fechaInicio);
        this.cambiarFecha();
        this.cargarHorarioGuardado(data.items!);
      }, 500);
    }
  }

  cambiarDiaLibre(): void {
    this.listaHorarioTrabajadorItem.forEach(
      (items: HorarioTrabajadorItem[], index: number) => {
        if (index === this.preSelectedIndexes[0]) {
          items.forEach((item: HorarioTrabajadorItem, i: number) => {
            if (i === this.preSelectedIndexes[1]) {
              item.bloque = undefined;
              item.idBloqueHoras = undefined;
              item.diaLibre = true;
              item.diaDescanso = false;
            }
          });
        }
      }
    );
    this.idPatronSelected = undefined;
  }

  getEdificio(idSede?: string) {
    return this.listaSedes.find((item) => item.id === idSede)?.nombre;
  }

  asignarEdificio(idSede: string) {
    this.listaHorarioTrabajadorItem.forEach(
      (items: HorarioTrabajadorItem[], index: number) => {
        if (index === this.preSelectedIndexes[0]) {
          items.forEach((item: HorarioTrabajadorItem, i: number) => {
            if (i === this.preSelectedIndexes[1]) {
              item.idSede = idSede;
            }
          });
        }
      }
    );
  }

  cambiarDiaDescanso(): void {
    this.listaHorarioTrabajadorItem.forEach(
      (items: HorarioTrabajadorItem[], index: number) => {
        if (index === this.preSelectedIndexes[0]) {
          items.forEach((item: HorarioTrabajadorItem, i: number) => {
            if (i === this.preSelectedIndexes[1]) {
              item.bloque = undefined;
              item.idBloqueHoras = undefined;
              item.diaLibre = false;
              item.diaDescanso = true;
              item.idSede = undefined;
            }
          });
        }
      }
    );
    this.idPatronSelected = undefined;
  }

  cargarTurnos() {
    this.turnoTrabajoService.findAll().subscribe({
      next: (data) => {
        this.listaTurnos = data;
      },
    });
  }

  cargarPatronesHorario() {
    this.patronHorarioService.findAll().subscribe({
      next: (data) => {
        this.listaPatronesHorario = data;
      },
    });
  }

  cargarTipoTurnos() {
    this.tipoTurnoService.findAll().subscribe({
      next: (data) => {
        this.listaTipoTurno = data;
      },
    });
  }

  get disabledBloque(): boolean {
    return (
      !this.formData.get('idTipoTurno')?.value ||
      !this.formData.get('idTrabajador')?.value
    );
  }

  loadData() {
    const q: Record<string, any> = {
      filter: false,
      isActive: true,
    };
    this.trabajadorStore.loadAll(undefined, undefined, q);
  }

  cargarBloqueHoras() {
    this.bloqueHorasService.findAll().subscribe({
      next: (data) => {
        this.listaBloqueHoras = data;
        if (this.selectedBloqueId) {
          const bloque = this.listaBloqueHoras.find(
            (b) => b.id === this.selectedBloqueId
          );
          if (bloque) {
            this.selectedBloque = bloque;
          }
        }
      },
    });
  }

  get disableDate() {
    return !this.formData.get('idTipoPatron')?.value;
  }

  selectSede(event: SelectChangeEvent) {
    this.formData.get('idTrabajador')?.setValue(undefined);
    this.formData.get('idTrabajador')?.enable();
    this.selectTipoPatron();
  }

  selectTrabajador(event?: SelectChangeEvent) {
    const trabajador = this.listaTrabajadores.find(
      (item) => item.id == this.formData.get('idTrabajador')?.value
    );
    this.nombreTrabajador = `${trabajador?.nombre} ${trabajador?.apellido}`;

    this.formData
      .get('horasDiarias')
      ?.setValue(trabajador?.contratos[0]?.horasContrato);

    if (!this.id) {
      this.formData.get('idTipoTurno')?.enable();

      this.formData.get('idTipoPatron')?.enable();
    }

    this.formData.get('idTipoTurno')?.setValue(this.listaTipoTurno[0].id);

    this.listaSedes = trabajador?.sedes!;

    this.selectTipoPatron();

    this.itemsMenuContext = [
      {
        label: 'Descanso',
        icon: 'pi pi-star',
        command: () => this.cambiarDiaDescanso(),
      },
      {
        label: 'Libre',
        icon: 'pi pi-calendar-clock',
        command: () => this.cambiarDiaLibre(),
      },
      {
        separator: true,
      },
      {
        label: 'Asignar edificio',
        icon: 'pi pi-building',
        items: this.listaSedes.map((item) => ({
          label: item.nombre,
          command: () => this.asignarEdificio(item.id),
        })),
      },
    ];
  }

  selectTipoTurno(event?: any) {
    const tipo = this.listaTipoTurno.find(
      (item) => item.id === this.formData.get('idTipoTurno')?.value
    );
    const len = this.listaHorarioTrabajadorItem.length;
    const numBloques = tipo?.numBloques as number;
    if (len === 0) {
      this.listaHorarioTrabajadorItem = Array(numBloques)
        .fill(
          Array(7).fill({
            idBloqueHoras: undefined,
            diaLibre: true,
            diaDescanso: false,
            bloque: undefined,
            idSede: undefined,
            disabled: true,
          })
        )
        .map((item: any[], index) =>
          item.map((d, i) => ({ numTurno: index + 1, diaSemEntrada: i, ...d }))
        );
    } else if (numBloques < len) {
      this.listaHorarioTrabajadorItem = this.listaHorarioTrabajadorItem.slice(
        0,
        numBloques
      );
    } else {
      this.listaHorarioTrabajadorItem.push(
        ...Array(numBloques - len)
          .fill(
            Array(7).fill({
              idBloqueHoras: undefined,
              diaLibre: true,
              diaDescanso: false,
              bloque: undefined,
              idSede: undefined,
              disabled: true,
            })
          )
          .map((item: any[], index) =>
            item.map((d, i) => ({
              numTurno: len + index + 1,
              diaSemEntrada: i,
              ...d,
            }))
          )
      );
    }
  }

  selectTipoPatron(e?: any) {
    const patron = this.listaTipoPatrones.find(
      (item) => item.id === this.formData.get('idTipoPatron')?.value
    );
    this.isMonth = false;
    this.monthSelected = undefined;
    if (patron?.codigo === 'month') {
      this.isMonth = true;
      this.listaHorarioTrabajadorItem = [];
    } else if (patron?.codigo === 'week') {
      this.listaHorarioTrabajadorItem = Array(1)
        .fill(
          Array(7).fill({
            idBloqueHoras: undefined,
            diaLibre: true,
            diaDescanso: false,
            bloque: undefined,
            idSede: undefined,
            disabled: false,
          })
        )
        .map((item: any[], index) =>
          item.map((d, i) => ({
            numTurno: index + 1,
            diaSemEntrada: i,
            numDia: (i + 1) * (index + 1),
            ...d,
          }))
        );
    } else if (patron?.codigo === '2weeks') {
      this.listaHorarioTrabajadorItem = Array.from({ length: 2 }, (_, index) =>
        Array.from({ length: 7 }, (_, i) => {
          const numDia = index * 7 + i + 1;
          return {
            idBloqueHoras: undefined,
            diaLibre: true,
            diaDescanso: false,
            bloque: undefined,
            idSede: undefined,
            disabled: false,
            numTurno: index + 1,
            diaSemEntrada: i,
            numDia: numDia,
          };
        })
      );
    }

    this.listaPatrones = this.listaPatronesHorario.filter(
      (item) => item.idTipoTurno === this.formData.get('idTipoTurno')?.value
    );

    this.idPatronSelected = undefined;
  }

  cambiarFecha(e?: any) {
    if (this.monthSelected) {
      const daysMonth = getDiasDelMes(this.monthSelected);

      this.listaHorarioTrabajadorItem = [];

      let numTurno = 1;

      let bloque: HorarioTrabajadorItem[] = Array(7)
        .fill({
          dia: undefined,
          idBloqueHoras: undefined,
          diaLibre: true,
          diaDescanso: false,
          bloque: undefined,
          idSede: undefined,
          disabled: true,
        } as HorarioTrabajadorItem)
        .map((d, i) => ({ numTurno: numTurno, diaSemEntrada: i, ...d }));

      daysMonth.forEach((day, i) => {
        if (day.numDia === 0) {
          bloque = Array(7)
            .fill({
              dia: undefined,
              idBloqueHoras: undefined,
              diaLibre: true,
              diaDescanso: false,
              bloque: undefined,
              idSede: undefined,
              disabled: true,
            } as HorarioTrabajadorItem)
            .map((d, i) => ({ numTurno: numTurno, diaSemEntrada: i, ...d }));
        }
        bloque.forEach((item) => {
          if (item.diaSemEntrada === day.numDia) {
            item.numDia = day.dia;
            item.disabled = false;
          }
        });
        if (day.numDia === 6 || daysMonth.length === i + 1) {
          this.listaHorarioTrabajadorItem.push(bloque);
          numTurno++;
        }
      });
    }
  }

  selectPatronPreguardado(event: any) {
    const patron = this.listaPatrones.find(
      (item) => item.id === this.idPatronSelected
    );
    if (patron && patron.items) {
      this.listaHorarioTrabajadorItem.forEach(
        (items: HorarioTrabajadorItem[], index: number) => {
          const pItems = (patron.items ?? []).filter((p: PatronHorarioItem) =>
            p.numTurno ? p.numTurno - 1 == index : false
          );
          if (pItems.length !== 0) {
            items.forEach((item: HorarioTrabajadorItem, i: number) => {
              const pItem = pItems.find((p) => p.diaSemEntrada === i);
              if (pItem) {
                item.bloque = pItem.bloque;
                item.idBloqueHoras = pItem.idBloqueHoras;
                item.diaLibre = pItem.diaLibre;
                item.diaDescanso = pItem.diaDescanso;
                item.idSede =
                  this.listaSedes.length == 1
                    ? this.listaSedes[0].id
                    : undefined;
              }
            });
          }
        }
      );
    }
  }

  cargarHorarioGuardado(horarioItems: HorarioTrabajadorItem[]) {
    this.listaHorarioTrabajadorItem.forEach(
      (items: HorarioTrabajadorItem[], index: number) => {
        const pItems = horarioItems.filter((p: PatronHorarioItem) =>
          p.numTurno ? p.numTurno - 1 == index : false
        );
        if (pItems.length !== 0) {
          items.forEach((item: HorarioTrabajadorItem, i: number) => {
            const pItem = pItems.find((p) => p.diaSemEntrada === i);
            if (pItem) {
              item.id = pItem.id;
              item.bloque = pItem.bloque;
              item.idBloqueHoras = pItem.idBloqueHoras;
              item.diaLibre = pItem.diaLibre;
              item.diaDescanso = pItem.diaDescanso;
              item.idSede = pItem.idSede;
              item.marcado = pItem.marcado;
              item.disabled = pItem.marcado;
            }
          });
        }
      }
    );
  }

  crearBloqueHoras(item: any) {
    const ref = this.dialogService.open(SelectHoraComponent, {
      header: 'Asignar Hora',
      styleClass: 'modal-md',
      focusOnShow: false,
      modal: true,
      dismissableMask: false,
      closable: true,
    });
    ref.onClose.subscribe((res) => {
      if (res) {
        this.selectedBloqueId = res.id;
        this.cargarBloqueHoras();
      }
    });
  }

  asignarBloque(item: HorarioTrabajadorItem) {
    if (this.selectedBloque) {
      item.idBloqueHoras = this.selectedBloque.id;
      item.bloque = this.selectedBloque;
      item.diaLibre = false;
      item.diaDescanso = false;
      item.idSede =
        this.listaSedes.length == 1 ? this.listaSedes[0].id : undefined;
      this.idPatronSelected = undefined;
    }
  }

  onContextMenu(event: any, indexes: number[]) {
    this.preSelectedIndexes = indexes;
    this.cm.target = event.currentTarget;
    this.cm.show(event);
  }

  onHide() {
    this.preSelectedIndexes = [];
  }

  get invalidHorario(): boolean {
    if (this.listaHorarioTrabajadorItem.length === 0) {
      return true;
    }

    let tieneBloque = false;

    const tieneItemInvalido = this.listaHorarioTrabajadorItem.some(
      (items: any[]) =>
        items.some((item: any) => {
          if (item.bloque) {
            tieneBloque = true;
            return (
              item.idSede === null ||
              item.idSede === undefined ||
              item.idSede === ''
            );
          }
          return false;
        })
    );

    return !tieneBloque || tieneItemInvalido;
  }

  preGuardar() {
    this.msg.confirm(
      `
      <div class='px-4 py-2 max-w-150'>
        <p class="text-center">
          ¿Está seguro de asignar un nuevo horario a <span class="uppercase font-bold">${this.nombreTrabajador}</span>?
        </p>
        <p> Ten en cuenta que: </p>
        <ul class="ps-6 text-sm">
          <li class="list-disc">Si existe un horario anterior, este se dará por finalizado en la fecha de inicio del nuevo horario.</li>
          <li class="list-disc">Si existe un horario con la misma fecha de inicio, este se eliminará antes de registrar el nuevo horario.</li>
        </ul>
      </div>
      `,
      () => {
        const { horasDiarias, ...form }: any = sanitizedForm(
          this.formData.getRawValue()
        );
        if (!this.idPatronSelected && !this.isMonth) {
          const ref = this.dialogService.open(FormPatronComponent, {
            header: 'Guardar patrón',
            styleClass: 'modal-md',
            data: {
              idTipoTurno: form.idTipoTurno,
              idTipoPatron: form.idTipoPatron,
              items: this.listaHorarioTrabajadorItem
                .flatMap((items) =>
                  items.map((item) => {
                    const { marcado, ...rest } = item;
                    return {
                      ...rest,
                    };
                  })
                )
                .filter((item) => !item.disabled)
                .map((item) => {
                  const { disabled, ...dto } = item;
                  return dto;
                }),
            },
            modal: true,
            dismissableMask: false,
            closeOnEscape: false,
          });
          ref.onClose.subscribe((res) => {
            if (res?.id) {
              this.guardar(res.id);
            } else {
              this.guardar();
            }
          });
        } else {
          this.guardar();
        }
      }
    );
  }

  guardar(id?: string) {
    const { horasDiarias, ...form } = sanitizedForm(
      this.formData.getRawValue()
    );
    if (!this.id) {
      this.horarioTrabajadorService
        .create({
          ...form,
          idPatronHorario: id,
          fechaInicio: this.monthSelected,
          fechaFin: this.isMonth ? this.monthSelected : undefined,
          items: this.listaHorarioTrabajadorItem
            .flatMap((items) =>
              items.map((item) => {
                const { marcado, ...rest } = item;
                return {
                  ...rest,
                };
              })
            )
            .filter((item) => !item.disabled)
            .map((item) => {
              const { disabled, ...dto } = item;
              return dto;
            }),
        } as HorarioTrabajador)
        .subscribe({
          next: (data) => {
            this.msg.success('¡Registrado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            console.error(e);
            this.msg.error(e.error.message);
          },
        });
    } else {
      this.horarioTrabajadorService
        .update(this.id, {
          ...form,
          idPatronHorario: id,
          fechaInicio: this.monthSelected,
          fechaFin: this.isMonth ? this.monthSelected : undefined,
          items: this.listaHorarioTrabajadorItem
            .flatMap((items) =>
              items.map((item) => {
                const { marcado, ...rest } = item;
                return {
                  ...rest,
                };
              })
            )
            .filter((item) => !item.disabled)
            .map((item) => {
              const { disabled, ...dto } = item;
              return dto;
            }),
        } as HorarioTrabajador)
        .subscribe({
          next: (data) => {
            this.msg.success('¡Registrado con éxito!');
            this.ref.close(data);
          },
          error: (e) => {
            console.error(e);
            this.msg.error(e.error.message);
          },
        });
    }
  }
}
