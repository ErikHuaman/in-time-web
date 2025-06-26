import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-cancel',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button variant="outlined" severity="help" size="small">
      <div class="flex justify-center items-center gap-1">
        <iconify-icon [icon]="icon" class="text-lg"></iconify-icon>
        <div>{{ label }}</div>
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonCancelComponent {
  @Input() label: string = 'Cancelar';
  @Input() icon: string = 'lucide:ban';
}
