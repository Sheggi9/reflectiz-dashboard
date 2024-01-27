import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, map, Observable} from "rxjs";
import {GeoDot, GeoRequestDto, GeoResponseDto} from "@interfaces";

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  geocode(citiesData: GeoRequestDto[]): Observable<GeoDot[]> {
    const cityQuery = citiesData.map(el => el.query)
    const reqSet =  cityQuery.map(city => {
      const params = {
        q: city,
        format: 'json',
        limit: 1,
      };
      return this.http.get<[GeoResponseDto]>(this.nominatimUrl, { params });
    })

    return forkJoin(reqSet).pipe(
      map(v => v.map((el, i) => {
          return {
            lat: el[0].lat,
            lon: el[0].lon,
            userCount: citiesData[i].counter,
            name: el[0].name,
            originalCityName: citiesData[i].city
          };
        })
      )
    )
  }
}
