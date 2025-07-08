import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonCustomComponent } from '@components/buttons/button-custom/button-custom.component';
import { AsignacionSedeUsuario } from '@models/asignacion-sede-usuario.model';
import { Rol } from '@models/rol.model';
import { Sede } from '@models/sede.model';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';
import { Usuario } from '@models/usuario.model';
import { AsignacionSedeUsuarioService } from '@services/asignacion-sede-usuario.service';
import { MessageGlobalService } from '@services/message-global.service';
import { RolService } from '@services/rol.service';
import { SedeService } from '@services/sede.service';
import { TipoDocIdentService } from '@services/tipo-doc-ident.service';
import { UsuarioService } from '@services/usuario.service';
import { RolStore } from '@stores/rol.store';
import { SedeStore } from '@stores/sede.store';
import { TipoDocIdentStore } from '@stores/tipo-doc-ident.store';
import { UsuarioStore } from '@stores/usuario.store';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-form-usuario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    ToggleSwitchModule,
    SelectModule,
    MultiSelectModule,
    ButtonCustomComponent,
  ],
  templateUrl: './form-usuario.component.html',
  styles: ``,
})
export class FormUsuarioComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly msg = inject(MessageGlobalService);

  private readonly sanitizer = inject(DomSanitizer);

  private readonly tipoDocStore = inject(TipoDocIdentStore);

  private readonly rolStore = inject(RolStore);

  readonly store = inject(UsuarioStore);

  private readonly asignacionSedeUsuarioService = inject(
    AsignacionSedeUsuarioService
  );

  private readonly sedeStore = inject(SedeStore);

  formData = new FormGroup({
    usuario: new FormGroup({
      nombre: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      apellido: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      username: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      idTipoDocID: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      identificacion: new FormControl<string | undefined>(
        { value: undefined, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      password: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [],
      }),
      idRol: new FormControl<string | undefined>(undefined, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      isActive: new FormControl<boolean>(true, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
    sedes: new FormGroup({
      idSedes: new FormControl<string[]>([], {
        nonNullable: true,
        validators: [],
      }),
    }),
  });

  id!: string;
  previewUrl: SafeUrl = '';
  archivo?: File;

  get listaTipoDocId(): TipoDocIdent[] {
    return this.tipoDocStore.items();
  }

  get listaSedes(): Sede[] {
    return this.sedeStore
      .items()
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get listaRoles(): Rol[] {
    return this.rolStore.items();
  }

  get loading(): boolean {
    return this.store.loading();
  }

  private resetOnSuccessEffect = effect(() => {
    const { selectedItem, error, lastAction } = this.store;

    const item = selectedItem();
    const action = lastAction();
    const currentError = error();

    // Manejo de errores
    if (currentError) {
      console.log('error', error);
      this.msg.error(
        currentError ??
          '¡Ups, ocurrió un error inesperado al guardar el usuario!'
      );
      return; // Salimos si hay un error
    }

    // Si se ha creado o actualizado correctamente
    if (action === 'created' || action === 'updated') {
      this.msg.success(
        action === 'created'
          ? '¡Usuario creado exitosamente!'
          : '¡Usuario actualizado exitosamente!'
      );

      this.store.clearSelected();
      this.ref.close(true);
      return;
    }

    // Si hay un item seleccionado, se carga en el formulario
    if (item && item.id != this.id) {
      this.id = item.id ?? null;
      this.formData.get('usuario.nombre')?.setValue(item.nombre);
      this.formData.get('usuario.apellido')?.setValue(item.apellido);
      this.formData.get('usuario.idTipoDocID')?.setValue(item.idTipoDocID);
      this.formData
        .get('usuario.identificacion')
        ?.setValue(item.identificacion);
      this.formData.get('usuario.username')?.setValue(item.username);
      this.formData.get('usuario.idRol')?.setValue(item.idRol);
      this.formData.get('usuario.isActive')?.setValue(item.isActive);
      this.formData.get('usuario.identificacion')?.enable();
      this.formData
        .get('sedes.idSedes')
        ?.setValue(item.sedes?.map((item) => item.id as string));

      if (item.archivoNombre) {
        this.getArchivoBiometrico(item.id);
      }
    }
  });

  private getFileEffect = effect(() => {
    this.previewUrl = this.store.previewUrl();
  });

  ngOnInit(): void {
    this.rolStore.loadAll();
    this.sedeStore.loadAll();
    this.tipoDocStore.loadAll();
  }

  selectTipoDocId(event: any) {
    this.formData.get('usuario.identificacion')?.enable();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  get isActive(): boolean {
    return this.formData.get('usuario.isActive')?.value ?? false;
  }

  getArchivoBiometrico(id: string) {
    this.store.getFile(id);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
          );
          this.archivo = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    const formUsuario = this.formData.get('usuario')?.value;
    const sedes = this.formData.get('sedes.idSedes')?.value.map((item) => ({
      id: item,
    }));
    if (this.id) {
      this.store.update(
        this.id,
        {
          id: this.id,
          ...formUsuario,
          sedes,
        } as Usuario,
        { file: this.archivo }
      );
    } else {
      this.store.create({ ...formUsuario, sedes } as Usuario, {
        file: this.archivo,
      });
    }
  }
}
