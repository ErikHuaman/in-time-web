import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-enviar-comprobante',
  imports: [
    CommonModule,
    FormsModule,
    RadioButtonModule,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './enviar-comprobante.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EnviarComprobanteComponent implements OnInit {
  public readonly ref: DynamicDialogRef = inject(DynamicDialogRef);

  private readonly dialogService: DialogService = inject(DialogService);

  canal: string = 'email';
  nombre: string = '';
  correos: string = '';
  celular: string = '';

  ngOnInit(): void {
    const instance = this.dialogService.getInstance(this.ref);

    const data = instance.data;

    if (data) {
      this.nombre = data?.labelName;
      this.correos = data?.infos?.[0].correo;
      this.celular = data?.infos?.[0].celular;
    }
  }
}
