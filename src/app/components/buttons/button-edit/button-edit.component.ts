import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-edit',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      text
      severity="success"
      size="small"
      rounded
      styleClass="!w-7.5 !px-0.5"
      pTooltip="Editar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="'lucide:bolt'" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonEditComponent {}
