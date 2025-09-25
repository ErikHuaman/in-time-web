import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'btn-custom',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button
      pButton
      rounded
      [text]="text"
      [severity]="severity"
      [pTooltip]="tooltip"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
      (click)="onHandler()"
      [disabled]="disabled"
    >
      <iconify-icon [icon]="icon" class="!text-lg" pButtonIcon />
    </button>
  `,
  styles: ``,
})
export class BtnCustomComponent {
  @Input() severity: ButtonSeverity = 'info';
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() text: boolean = true;
  @Input() disabled!: boolean;

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
