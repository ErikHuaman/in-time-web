import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'button-save',
  imports: [ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      severity="info"
      size="small"
      [disabled]="disabled"
      [loading]="loading"
    >
      <div class="flex justify-center items-center gap-1">
        <iconify-icon [icon]="icon" class="text-lg"></iconify-icon>
        <div>{{ label }}</div>
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonSaveComponent {
  @Input() label: string = 'Guardar';
  @Input() icon: string = 'lucide:save';
  @Input() disabled!: boolean;
  @Input() loading!: boolean;
}
