import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import 'iconify-icon';
import 'ol/ol.css';

(window as any).global = window;

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
