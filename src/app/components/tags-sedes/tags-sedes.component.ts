import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Sede } from '@models/sede.model';
import { ChipModule } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'tags-sedes',
  imports: [CommonModule, TooltipModule, ChipModule, PopoverModule],
  template: `
    <div class="flex justify-center">
      <div
        class="max-w-100 flex flex-wrap gap-2 items-center justify-center text-sm font-light capitalize italic"
        [ngClass]="{ 'cursor-pointer': sedes.length > 4 }"
        (click)="op.toggle($event)"
        [pTooltip]="sedes.length > 4 ? 'Ver más' : ''"
        tooltipPosition="top"
        tooltipStyleClass="!text-xs !font-normal !p-0"
      >
        <!-- Mostrar los primeros 5 -->
        @for (sede of sedes.slice(0, 4); track $index) {
        <p-chip class="!py-1 !px-2 shadow !bg-amber-200">
          <div class="text-xs font-medium">{{ sede.nombre }}</div>
        </p-chip>
        }

        <!-- Mostrar "..." si hay más de 5 -->
        @if (sedes.length > 4) {
        <span class="text-xs font-semibold">...</span>
        }
      </div>
      <p-popover #op styleClass="gap-2 p-2">
        <div class="max-w-100 max-h-40 overflow-y-auto flex flex-col">
          <div
            class="flex flex-wrap gap-2 items-center justify-center text-sm font-light uppercase italic"
          >
            @for (sede of sedes; track $index) {
            <p-chip class="!py-1 !px-2 shadow !bg-amber-200">
              <div class="text-xs font-medium">{{ sede.nombre }}</div>
            </p-chip>
            }
          </div>
        </div>
      </p-popover>
    </div>
  `,
  styles: ``,
})
export class TagsSedesComponent {
  @Input() sedes: Sede[] = [];
}
