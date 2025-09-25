import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { Dispositivo } from '@models/dispositivo.model';
import { DispositivoService } from '@services/dispositivo.service';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { FormDispositivoComponent } from './form-dispositivo/form-dispositivo.component';
import { BadgeModule } from 'primeng/badge';
import { TitleCardComponent } from '@components/title-card/title-card.component';
import { MessageGlobalService } from '@services/message-global.service';
import { BtnEditComponent } from '@components/buttons/btn-edit.component';
import { BtnDeleteComponent } from '@components/buttons/btn-delete.component';
import { ButtonEditComponent } from '@components/buttons/button-edit.component';
import { ButtonDeleteComponent } from '@components/buttons/button-delete.component';

@Component({
  selector: 'app-dispositivos',
  imports: [
    CommonModule,
    ButtonModule,
    BadgeModule,
    TitleCardComponent,
    ButtonEditComponent,
    ButtonDeleteComponent,
  ],
  templateUrl: './dispositivos.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispositivosComponent implements OnInit {
  title: string = 'Dispositivos';

  icon: string = 'material-symbols:phonelink-ring-outline';

  private readonly dialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly dispositivoService = inject(DispositivoService);

  listaDispositivos: Dispositivo[] = [];

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.dispositivoService.getAll().subscribe({
      next: (data) => {
        this.listaDispositivos = data.data;
      },
    });
  }

  addNew() {
    const ref = this.dialogService.open(FormDispositivoComponent, {
      header: 'Nuevo dispositivo',
      styleClass: 'modal-md',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarDispositivos();
      }
    });
  }

  edit(id: string) {
    const ref = this.dialogService.open(FormDispositivoComponent, {
      header: 'Editar dispositivo',
      styleClass: 'modal-md',
      data: { id },
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.cargarDispositivos();
      }
    });
  }

  remove(item: Dispositivo) {
    this.msg.confirm(
      `<div class='px-4 py-2'>
            <p class='text-center'> ¿Está seguro de eliminar el dispositivo <span class='uppercase font-bold'>${item.nombre}</span>? </p>
            <p class='text-center'> Esta acción no se puede deshacer. </p>
          </div>`,
      () => {
        this.dispositivoService.delete(item.id!).subscribe({
          next: () => {
            this.cargarDispositivos();
          },
        });
      }
    );
  }
}
