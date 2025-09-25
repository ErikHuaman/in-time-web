import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'btn-delete',
  imports: [ButtonModule, TooltipModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button
      pButton
      rounded
      text
      severity="danger"
      pTooltip="Eliminar"
      tooltipPosition="top"
      tooltipStyleClass="!text-xs !font-normal !p-0"
      (click)="onHandler()"
    >
      <iconify-icon [icon]="'lucide:trash-2'" class="!text-lg" pButtonIcon />
    </button>
  `,
  styles: ``,
})
export class BtnDeleteComponent {
  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
