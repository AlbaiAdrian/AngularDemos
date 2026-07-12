import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { WeatherForecast } from '../models/weather-forecast';

@Injectable({
    providedIn:'root'
})
export class WeatherService {

    private http = inject(HttpClient);

    private apiUrl = 'http://localhost:5088/weatherforecast';

    getForecast(): Observable<WeatherForecast[]> {
        return this.http.get<WeatherForecast[]>(this.apiUrl);
    }
}
