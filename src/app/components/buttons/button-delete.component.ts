import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-delete',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      severity="danger"
      size="small"
      rounded
      styleClass="!w-6 !h-6 !p-0.5"
      class="flex justify-center items-center !w-6 !h-6"
      pTooltip="Eliminar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'lucide:trash-2'" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonDeleteComponent {}
