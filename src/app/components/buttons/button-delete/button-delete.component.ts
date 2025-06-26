import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-delete',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      text
      severity="danger"
      size="small"
      rounded
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Eliminar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <iconify-icon [icon]="'lucide:trash-2'" class="text-lg" />
    </p-button>
  `,
  styles: ``,
})
export class ButtonDeleteComponent {}
