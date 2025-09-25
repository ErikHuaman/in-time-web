import {
  Directive,
  ViewContainerRef,
  Input,
  OnInit,
  ComponentRef,
  inject,
  runInInjectionContext,
  effect,
} from '@angular/core';
import { SkeletonTableComponent } from './skeleton-table.component';

@Directive({
  selector: '[skeletonTable]',
  standalone: true,
})
export class SkeletonTableDirective implements OnInit {
  private vcr = inject(ViewContainerRef);
  private injector = this.vcr.injector;

  @Input('skeletonTable') context!: {
    loading: boolean | (() => boolean);
    numCols: number;
    numRows?: number;
  };

  ngOnInit() {
    const compRef: ComponentRef<SkeletonTableComponent> =
      this.vcr.createComponent(SkeletonTableComponent);

    this.vcr.createEmbeddedView(compRef.instance.templateRef);

    // Ejecutamos el efecto reactivo dentro del contexto de inyección
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const resolve = <T>(v: T | (() => T)): T =>
          typeof v === 'function' ? (v as () => T)() : v;

        compRef.instance.loading = resolve(this.context.loading);
        compRef.instance.numCols = this.context.numCols;
        compRef.instance.numRows = resolve(this.context.numRows ?? 4);
      });
    });
  }
}
