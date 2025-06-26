import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [CommonModule,RouterModule, HeaderComponent],
  templateUrl: './main.component.html',
  styles: ``,
})
export class MainComponent {}
