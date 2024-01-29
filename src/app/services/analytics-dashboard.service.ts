import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsDashboardService {
  widgetsIsDraggable = new BehaviorSubject(false);
  widgetsIsResizable = new BehaviorSubject(false);
  widgetsIsActive = new BehaviorSubject(false);

  constructor() { }
}
