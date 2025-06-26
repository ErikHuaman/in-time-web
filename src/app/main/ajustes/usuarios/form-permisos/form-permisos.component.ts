import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modulo } from '@models/grupo-modulo.model';
import { PermisoRol } from '@models/permiso-rol.model';
import { MessageGlobalService } from '@services/message-global.service';
import { ModuloService } from '@services/modulo.service';
import { PermisoRolService } from '@services/permiso-rol.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-form-permisos',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
  ],
  templateUrl: './form-permisos.component.html',
  styles: ``,
})
export class FormPermisosComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  private readonly msg = inject(MessageGlobalService);

  private readonly moduloService = inject(ModuloService);

  private readonly permisoRolService = inject(PermisoRolService);

  listaModulos: any[] = [];

  id!: string;

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.id = data['id'];
    }

    this.cargarGrupoModulo(this.id);
  }

  cargarGrupoModulo(id: string) {
    this.moduloService.findAllByRol(id).subscribe({
      next: (data) => {
        this.listaModulos = data.map((item: any) => {
          item.permisos.todos = this.evaluarTodos(item.permisos);
          return item;
        });
        console.log('listaModulos', this.listaModulos);
      },
    });
  }

  evaluarTodos(permiso: PermisoRol) {
    return permiso.crear && permiso.editar && permiso.leer && permiso.eliminar;
  }

  selectAll(permiso: any) {
    permiso.crear = permiso.todos;
    permiso.editar = permiso.todos;
    permiso.leer = permiso.todos;
    permiso.eliminar = permiso.todos;
  }

  checkMarkRead(event: boolean, permiso: PermisoRol) {
    console.log('event', event);
    if (event) return;
    permiso.crear = false;
    permiso.editar = false;
    permiso.eliminar = false;
  }

  checkMarkAll(permiso: PermisoRol) {
    permiso.leer =
      permiso.crear || permiso.editar || permiso.eliminar || permiso.leer;
    permiso.todos = permiso.crear && permiso.editar && permiso.eliminar && permiso.leer;
  }

  guardar() {
    const array: PermisoRol[] = this.listaModulos.flatMap((item: any) => {
      const { todos, ...permiso } = item.permisos;
      return permiso as PermisoRol;
    });
    this.permisoRolService.multipleCreate(array).subscribe({
      next: (data) => {
        this.msg.success('¡Registrado con éxito!');
        this.ref.close(data);
      },
    });
  }
}
