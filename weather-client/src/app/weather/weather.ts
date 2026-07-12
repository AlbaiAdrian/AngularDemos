import { Component, inject, signal } from '@angular/core';
import { WeatherForecast } from '../models/weather-forecast';
import { WeatherService } from '../services/weather-service';

@Component({
  selector: 'app-weather',
  standalone: true,
  templateUrl: './weather.html'
})
export class WeatherComponent {

  private weatherService = inject(WeatherService);

  // forecasts: WeatherForecast[] = [];
  forecasts = signal<WeatherForecast[]>([]);

  ngOnInit() {
    this.weatherService.getForecast()
      .subscribe(data => this.forecasts.set(data));
  }
}