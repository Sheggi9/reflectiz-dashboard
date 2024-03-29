import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, OnDestroy,
  OnInit, TemplateRef,
  ViewChild
} from '@angular/core';
import {DatePipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from "@angular/material/table";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {
  DisplayGrid,
  GridsterComponent,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent, GridsterItemComponentInterface,
  GridType
} from "angular-gridster2";
import {Chart, ChartConfiguration, ChartType, registerables} from "chart.js";
import {MapComponent} from "../../components/map/map.component";
import {
  mostCommonHobbyConf,
  mostPickedColorsByAgeConf,
  mostPickedEngineByGenderConf
} from "@utils";
import {User, GeoDot, GeoRequestDto} from "@interfaces";
import {GeoService, UserService} from "@services";
import {combineLatest, combineLatestAll, Subject, take, takeUntil} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AnalyticsDashboardService} from "../../services/analytics-dashboard.service";

type isDraggable = boolean;
type isResizable = boolean;

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    GridsterComponent,
    GridsterItemComponent,
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    NgIf,
    DatePipe,
    MapComponent,
    MatProgressSpinner
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['birthday', 'email', 'firstName', 'lastName', 'gender', 'address', 'city', 'country', 'amountSeats', 'engine', 'color', 'hobby', 'star'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();
  private _destroy$ = new Subject();
  @ViewChild('unfoundedCountryRef') unfoundedCountryTemplate!: TemplateRef<any>;
  @ViewChild('mostPickedColorsByAgeCanvas') mostPickedColorsByAgeChartRef!: ElementRef;
  @ViewChild('mostPickedEngineByGenderCanvas') mostPickedEngineByGenderChartRef!: ElementRef;
  @ViewChild('mostCommonHobbyAmongstVisitorsCanvas') mostCommonHobbyAmongstVisitorsChartRef!: ElementRef;
  private mostPickedColorsByAgeChart: Chart<'bar'> | undefined;
  private mostPickedEngineByGenderChart: Chart<'bar'> | undefined;
  private mostCommonHobbyAmongstVisitorsChart: Chart<'doughnut'> | undefined;

  mapIsDraggable = true;
  options!: GridsterConfig;
  dashboard!: Array<GridsterItem>;
  dots: GeoDot[] | undefined = undefined;
  unfoundedCountry: GeoRequestDto[] = [];

  constructor(private userService: UserService, private cdr: ChangeDetectorRef, private geo: GeoService,  private snackBar: MatSnackBar, private analyticsDashboardService: AnalyticsDashboardService) {}

  eventStart(item: GridsterItem, itemComponent: GridsterItemComponentInterface, event: MouseEvent) {
    console.info('eventStart', item, itemComponent, event);
    this.mapIsDraggable = false;
  }

  eventStop(item: GridsterItem, itemComponent: GridsterItemComponentInterface, event: MouseEvent) {
    console.info('eventStop', item, itemComponent, event);
    this.mapIsDraggable = true;
  }

  ngOnInit(): void {

    this.analyticsDashboardService.widgetsIsActive.next(true);
    this.options = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.None,
      pushItems: false,
      draggable: {
        enabled: false,
        stop: this.eventStop.bind(this),
        start: this.eventStart.bind(this),
      },
      resizable: {
        enabled: false
      },
      minCols: 1,
      maxCols: 20,
      minRows: 1,
      maxRows: 20,
      maxItemCols: 20,
      minItemCols: 1,
      maxItemRows: 20,
      minItemRows: 1,
      maxItemArea: 400,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      addEmptyRowsCount: 0,
      mobileBreakpoint: 800,
      margin: 4,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
    };
    this.dashboard = [
      {
        "cols": 5,
        "rows": 3,
        "y": 5,
        "x": 0
      },
      {
        "cols": 5,
        "rows": 3,
        "y": 8,
        "x": 0
      },
      {
        "cols": 5,
        "rows": 5,
        "y": 0,
        "x": 0
      },
      {
        "cols": 5,
        "rows": 6,
        "y": 0,
        "x": 5
      },
      {
        "cols": 5,
        "rows": 5,
        "y": 6,
        "x": 5
      }
    ]

    const {widgetsIsDraggable, widgetsIsResizable} = this.analyticsDashboardService;

    combineLatest([widgetsIsDraggable, widgetsIsResizable]).pipe(
      takeUntil(this._destroy$)
    ).subscribe((v: [isDraggable, isResizable])=> {
      const isDraggable = v[0];
      const isResizable = v[1];

      this.options.draggable!.enabled = isDraggable
      this.options.resizable!.enabled = isResizable

      if (this.options.api) {
        this.options.api.optionsChanged!();
      }
    })
  }
  ngAfterViewInit(): void {
    this.userService.getUsers().pipe(
      takeUntil(this._destroy$)
    ).subscribe(v => {
      const ctx: CanvasRenderingContext2D = this.mostPickedColorsByAgeChartRef.nativeElement.getContext('2d');
      this.mostPickedColorsByAgeChart = this.createChart<'bar'>(ctx, mostPickedColorsByAgeConf(v));

      const ctx2: CanvasRenderingContext2D = this.mostPickedEngineByGenderChartRef.nativeElement.getContext('2d');
      this.mostPickedEngineByGenderChart = this.createChart(ctx2, mostPickedEngineByGenderConf(v));

      const ctx3: CanvasRenderingContext2D = this.mostCommonHobbyAmongstVisitorsChartRef.nativeElement.getContext('2d');
      this.mostCommonHobbyAmongstVisitorsChart = this.createChart(ctx3, mostCommonHobbyConf(v));

      this.dataSource.data = v;
      this.dataSource.connect();

      const reqData = v.reduce((acc, user) => {
        const searchStr = `${user.country.trim().toLowerCase()},${user.city.trim().toLowerCase()}`
        const userCity = user.city.trim();
        if (acc.has(userCity)) {
          const data = acc.get(userCity)!;
          const updatedData = {
            ...data,
            counter: data.counter + 1
          }
          acc.set(userCity, updatedData)
        } else {
          acc.set(userCity, {
            counter: 1,
            city: userCity,
            query: searchStr
          });
        }
        return acc;
      }, new Map<string, GeoRequestDto>())

      const requestParam: GeoRequestDto[] = Array.from(reqData.values());

      if (requestParam.length) {
        this.geo.geocode(Array.from(reqData.values())).pipe(
          takeUntil(this._destroy$)
        ).subscribe(r => {
          this.unfoundedCountry = [];
          this.dots = r.filter<GeoDot>((d, index): d is GeoDot => {
            const res = d !== null;
            if (!res) {
              this.unfoundedCountry.push(requestParam[index])
            }
            return res;
          });

          if (this.unfoundedCountry.length) {
            const ref = this.snackBar.openFromTemplate(this.unfoundedCountryTemplate, {
              duration: 5000,
            });
            ref.afterDismissed().pipe(
              take(1)
            ).subscribe(() => {
              this.unfoundedCountry = [];
            });
          }

          this.cdr.detectChanges();
        })
      } else {
        this.dots = [];
        this.cdr.detectChanges();
      }
    })
  }
  createChart<T extends ChartType>(ctx: CanvasRenderingContext2D, config: ChartConfiguration<T>): Chart<T> {
    Chart.register(...registerables);
    return new Chart<T>(ctx, config);
  }
  ngOnDestroy(): void {
    this.analyticsDashboardService.widgetsIsActive.next(false)
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
