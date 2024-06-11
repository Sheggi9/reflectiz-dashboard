import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

import {LeafletModule} from "@asymmetrik/ngx-leaflet";
import {circleMarker, latLng, latLngBounds, Map, MapOptions, tileLayer} from 'leaflet';

import {GeoDot} from "@interfaces";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    LeafletModule,
    NgIf
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent {
  _isDraggable = true;
  @Input() set isDraggable(v: boolean) {
    this._isDraggable = v;
    this.updateMapSettings();
  }
  get isDraggable() {
    return this._isDraggable;
  }
  private map: Map | undefined;
  private _dots!: GeoDot[] ;
  showMap = false;
  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
      }),
    ],
    maxZoom: 15,
    minZoom: 2.5,
    zoom: 2.5,
    maxBounds: latLngBounds(latLng(-90, -180), latLng(90, 180)),
    maxBoundsViscosity: 0.5,
  };

  constructor() {
    setInterval(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    } , 1000)
  }

  @Input() set dots(d: GeoDot[]) {
    this._dots = d.sort((a, b) => b.userCount - a.userCount)!;
    this.updateOptions();
  };
  get dots() {
    return this._dots;
  }
  onMapReady(map: Map): void {
    this.map = map;
    this.updateMapSettings();
    this.addMarkers();
  }
  private updateMapSettings() {
    if (this.map) {
      if (this.isDraggable) {
        this.map.dragging.enable();
      } else {
        this.map.dragging.disable();
      }
      this.map.invalidateSize();
    }
  }
  private updateOptions() {
    this.options.center = latLng(parseFloat(this.dots[0].lat), parseFloat(this.dots[0].lon));
    this.showMap = true;
  }
  private addMarkers(): void {
    this.dots.forEach(location => {
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      const marker = circleMarker([lat, lon], {
        radius: Math.sqrt(location.userCount) * 20,
        fillColor: '#745fc2',
        fillOpacity: 0.7,
        stroke: false,
      });

      marker.bindPopup(`<b>${location.originalCityName}</b><br>User Count: ${location.userCount}`);
      marker.addTo(this.map!);
    });
  }
}
