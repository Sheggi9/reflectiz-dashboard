import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {MatButton} from "@angular/material/button";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {AnalyticsDashboardService} from "./services/analytics-dashboard.service";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbar, MatButton, FormsModule, MatSlideToggle, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy{
  title = 'ReflectizApp';
  enableDrag: FormControl<boolean> = new FormControl();
  enableResize: FormControl<boolean> = new FormControl();
  dashboardIsActive = false;
  private _destroy$ = new Subject();

  constructor(private analyticsDashboardService: AnalyticsDashboardService, private cdr: ChangeDetectorRef) {
    this.analyticsDashboardService.widgetsIsActive.pipe(
      takeUntil(this._destroy$)
    ).subscribe(v => {
      this.dashboardIsActive = v;
      this.cdr.markForCheck();
    })

    this.enableDrag.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(v => this.analyticsDashboardService.widgetsIsDraggable.next(v))
    this.enableResize.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(v => this.analyticsDashboardService.widgetsIsResizable.next(v))

  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
