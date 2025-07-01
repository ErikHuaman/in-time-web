import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Dispositivo } from '@models/dispositivo.model';
import { DispositivoService } from '@services/dispositivo.service';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { FormDispositivoComponent } from './form-dispositivo/form-dispositivo.component';
import { BadgeModule } from 'primeng/badge';
import { TitleCardComponent } from '@components/title-card/title-card.component';

@Component({
  selector: 'app-dispositivos',
  imports: [CommonModule, ButtonModule, BadgeModule, TitleCardComponent],
  templateUrl: './dispositivos.component.html',
  styles: ``,
})
export class DispositivosComponent implements OnInit {
  title: string = 'Dispositivos';

  icon: string = 'material-symbols:phonelink-ring-outline';

  private readonly dialogService = inject(DialogService);

  private readonly dispositivoService = inject(DispositivoService);

  listaDispositivos: Dispositivo[] = [];

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.dispositivoService.findAll().subscribe({
      next: (data) => {
        this.listaDispositivos = data;
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
}
