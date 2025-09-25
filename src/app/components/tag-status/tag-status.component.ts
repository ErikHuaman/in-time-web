import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'tag-status',
  imports: [TagModule],
  template: `
    <p-tag
      [value]="status ? 'ACTIVO' : 'INACTIVO'"
      [severity]="status ? 'success' : 'warn'"
      styleClass="!py-0.5 !text-xs border"
      [rounded]="true"
    />
  `,
  styles: ``,
})
export class TagStatusComponent {
  @Input() status!: boolean;
}
