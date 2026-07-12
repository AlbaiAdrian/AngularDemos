import { Component } from '@angular/core';
import { WeatherComponent } from './weather/weather';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeatherComponent],
  template: `<app-weather />`
})
export class App {}