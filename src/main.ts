import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err: unknown) => {
  if (typeof console !== 'undefined' && console.error) {
    console.error('Failed to bootstrap application:', err);
  }
});
