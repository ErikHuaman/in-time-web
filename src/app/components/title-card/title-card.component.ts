import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
  selector: 'title-card',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 flex items-center justify-center"
      >
        <iconify-icon [icon]="icon" class="text-4xl" />
      </div>
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
    </div>
  `,
  styles: ``,
})
export class TitleCardComponent {
  @Input() icon!: string;
  @Input() title!: string;
}
