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
import { TrabajadorService } from '@services/trabajador.service';
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
import { mergeMap } from 'rxjs';
import { HorarioTrabajadorItemService } from '@services/horario-trabajador-item.service';
import { MessageGlobalService } from '@services/message-global.service';
import { PatronHorarioItem } from '@models/patron-horario-item.model';
import { Sede } from '@models/sede.model';
import { Cargo } from '@models/cargo.model';
import { TrabajadorStore } from '@stores/trabajador.store';

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

  private readonly tipoTurnoService = inject(TipoTurnoService);

  private readonly patronHorarioService = inject(PatronHorarioService);

  private readonly horarioTrabajadorService = inject(HorarioTrabajadorService);

  private readonly horarioTrabajadorItemService = inject(
    HorarioTrabajadorItemService
  );

  itemsMenuContext: MenuItem[] = [];
  isEditable: boolean = true;

  get listaTrabajadores(): Trabajador[] {
    return this.trabajadorStore
      .items()
      .filter((item) =>
        this.isEditable
          ? item.contratos[0].cargo.isEditable === true
          : item.contratos[0].cargo.isEditable === false &&
            item.contratos[0].cargo.isDescansero === true
      )
      .map((item) => {
        item.labelName = `${item.identificacion} | ${item.nombre} ${item.apellido}`;
        return item;
      });
  }

  listaSedes: Sede[] = [];

  listaCargos: Cargo[] = [];

  listaHorarioTrabajadorItem: HorarioTrabajadorItem[][] = [];

  formData = new FormGroup({
    idTrabajador: new FormControl<number | undefined>(undefined, {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
  idTurnoTrabajo?: string;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);
    this.isEditable = !!instance.data['isEditable'];
    this.cargarTrabajadoresActivos(this.isEditable);
    this.cargarTurnos();
    this.cargarTipoTurnos();
    this.cargarBloqueHoras();
    this.cargarPatronesHorario();
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
    console.log('idSede', idSede);
    this.listaHorarioTrabajadorItem.forEach(
      (items: HorarioTrabajadorItem[], index: number) => {
        if (index === this.preSelectedIndexes[0]) {
          items.forEach((item: HorarioTrabajadorItem, i: number) => {
            if (i === this.preSelectedIndexes[1]) {
              item.id = idSede;
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
              item.id = undefined;
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

  cargarTrabajadoresActivos(isEditable: boolean) {
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

  selectTrabajador(event: SelectChangeEvent) {
    const trabajador = this.listaTrabajadores.find(
      (item) => item.id == this.formData.controls['idTrabajador'].value
    );
    this.idTurnoTrabajo = trabajador?.controles[0]?.idTurnoTrabajo;

    this.formData.controls['horasDiarias'].setValue(
      trabajador?.contratos[0]?.horasContrato
    );

    this.formData.controls['idTipoTurno'].enable();

    this.formData.get('idTipoTurno')?.setValue(this.listaTipoTurno[0].id);
    this.selectTipoTurno();

    this.listaSedes = trabajador?.sedes!;

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
      (item) => item.id === this.formData.controls['idTipoTurno'].value
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
          })
        )
        .map((item: any[], index) =>
          item.map((d, i) => ({ numTurno: index + 1, numDia: i + 1, ...d }))
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
            })
          )
          .map((item: any[], index) =>
            item.map((d, i) => ({
              numTurno: len + index + 1,
              numDia: i + 1,
              ...d,
            }))
          )
      );
    }

    this.listaPatrones = this.listaPatronesHorario.filter(
      (item) => item.idTipoTurno === this.formData.controls['idTipoTurno'].value
    );

    this.idPatronSelected = undefined;
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
              const pItem = pItems.find((p) =>
                p.numDia ? p.numDia - 1 === i : false
              );
              if (pItem) {
                item.bloque = pItem.bloque;
                item.idBloqueHoras = pItem.idBloqueHoras;
                item.diaLibre = pItem.diaLibre;
                item.diaDescanso = pItem.diaDescanso;
                item.id =
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
      item.id = this.listaSedes.length == 1 ? this.listaSedes[0].id : undefined;
      this.idPatronSelected = undefined;
    }
  }

  onContextMenu(event: any, indexes: number[]) {
    if (this.selectedBloque) {
      this.preSelectedIndexes = indexes;
      this.cm.target = event.currentTarget;
      this.cm.show(event);
    }
  }

  onHide() {
    this.preSelectedIndexes = [];
  }

  get invalidHorario(): boolean {
    return (
      this.listaHorarioTrabajadorItem.length === 0 ||
      this.listaHorarioTrabajadorItem.every(
        (items: any[]) =>
          items.every((item: any) => !item.bloque) ||
          items.every((item: any) => !item.id)
      )
    );
  }

  preGuardar() {
    const form = this.formData.value;
    if (!this.idPatronSelected) {
      const ref = this.dialogService.open(FormPatronComponent, {
        header: 'Guardar patrón',
        styleClass: 'modal-md',
        data: {
          idTipoTurno: form.idTipoTurno,
          items: this.listaHorarioTrabajadorItem.flat(),
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

  guardar(id?: string) {
    console.log(this.formData.value);
    const form = this.formData.value;
    this.horarioTrabajadorService
      .create({
        ...form,
        idTurnoTrabajo: this.idTurnoTrabajo,
        idPatronHorario: id,
      } as HorarioTrabajador)
      .pipe(
        mergeMap((data: HorarioTrabajador) =>
          this.horarioTrabajadorItemService.createMany(
            this.listaHorarioTrabajadorItem.flatMap((items) =>
              items.map((item) => ({
                ...item,
                idHorarioTrabajador: data.id,
              }))
            )
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.msg.success('¡Registrado con éxito!');
          this.ref.close(data);
        },
        error: (e) => {
          console.log(e);
          this.msg.error(e.error.message);
        },
      });
  }
}
