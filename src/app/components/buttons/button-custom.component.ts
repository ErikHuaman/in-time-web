import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'button-custom',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-button
      text
      [severity]="severity"
      size="small"
      rounded
      styleClass="!w-6 !h-6 !p-0.5"
      class="flex justify-center items-center !w-6 !h-6"
      [disabled]="disabled"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
    >
      <div class="flex items-center justify-center">
        <iconify-icon [icon]="icon" class="text-lg" />
      </div>
    </p-button>
  `,
  styles: ``,
})
export class ButtonCustomComponent {
  @Input() severity: ButtonSeverity = 'info';
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() disabled!: boolean;
}
