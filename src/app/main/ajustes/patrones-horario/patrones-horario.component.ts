import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FormNewPatternComponent } from './form-new-pattern/form-new-pattern.component';

@Component({
  selector: 'app-patrones-horario',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    InputIcon,
    IconField,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './patrones-horario.component.html',
  styles: ``,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PatronesHorarioComponent {
  title: string = 'Patrones de marcación';

  icon: string = 'material-symbols:circles-ext-outline';

  ref!: DynamicDialogRef;

  private readonly dialogService = inject(DialogService);

  dataTable = [
    { codigo: 'PH01', nombre: '2 marcaciones', marcaciones: 2 },
    { codigo: 'PH02', nombre: '4 marcaciones', marcaciones: 4 },
    { codigo: 'PH03', nombre: '6 marcaciones', marcaciones: 6 },
  ];

  addNew() {
    this.dialogService.open(FormNewPatternComponent, {
      header: 'Nuevo patrón',
      styleClass: 'modal-xl',
      position: 'center',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
  }

  edit(item: any) {
    this.dialogService.open(FormNewPatternComponent, {
      header: 'Editar patrón',
      styleClass: 'modal-xl',
      position: 'center',
      modal: true,
      dismissableMask: false,
      closable: true,
    });
  }

  filterGlobal(dt: any, target: EventTarget | null) {
    dt.filterGlobal((target as HTMLInputElement).value, 'contains');
  }
}
