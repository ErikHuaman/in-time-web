import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'btn-add',
  imports: [ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button pButton [severity]="'primary'" size="small" (click)="onHandler()">
      <iconify-icon [icon]="icon" class="!text-lg" pButtonIcon />
      <span pButtonLabel class="!text-sm">{{ label }}</span>
    </button>
  `,
})
export class BtnAddComponent {
  @Input() severity: ButtonSeverity = 'info';
  @Input() icon: string = 'uil:plus';
  @Input() label: string = 'Agregar';
  @Input() disabled!: boolean;

  @Output() onClick = new EventEmitter();

  onHandler() {
    this.onClick.emit();
  }
}
