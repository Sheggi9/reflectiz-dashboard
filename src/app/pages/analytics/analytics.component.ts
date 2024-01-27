import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
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
  GridsterItemComponent,
  GridType
} from "angular-gridster2";
import {Chart, ChartConfiguration, ChartType, registerables} from "chart.js";
import {MapComponent} from "../../components/map/map.component";
import {
  mostCommonHobbyConf,
  mostPickedColorsByAgeConf,
  mostPickedEngineByGenderConf
} from "@utils";
import {User, GeoDot} from "@interfaces";
import {GeoService, UserService} from "@services";

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
export class AnalyticsComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['birthday', 'email', 'firstName', 'lastName', 'gender', 'address', 'city', 'country', 'amountSeats', 'engine', 'color', 'hobby', 'star'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();

  @ViewChild('mostPickedColorsByAgeCanvas') mostPickedColorsByAgeChartRef!: ElementRef;
  @ViewChild('mostPickedEngineByGenderCanvas') mostPickedEngineByGenderChartRef!: ElementRef;
  @ViewChild('mostCommonHobbyAmongstVisitorsCanvas') mostCommonHobbyAmongstVisitorsChartRef!: ElementRef;
  private mostPickedColorsByAgeChart: Chart<'bar'> | undefined;
  private mostPickedEngineByGenderChart: Chart<'bar'> | undefined;
  private mostCommonHobbyAmongstVisitorsChart: Chart<'doughnut'> | undefined;

  options!: GridsterConfig;
  dashboard!: Array<GridsterItem>;
  showMap = false;
  dots: GeoDot[] | undefined;

  constructor(private userService: UserService, private cdr: ChangeDetectorRef, private geo: GeoService) {
    setInterval(() => {
      console.log(this.dashboard)
    }, 2000)
  }

  ngOnInit(): void {
    this.options = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.None,
      pushItems: false,
      draggable: {
        enabled: false
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
  }
  ngAfterViewInit(): void {
    this.userService.getUsers().pipe().subscribe(v => {
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
      }, new Map<string, {
        counter: number,
        city: string,
        query: string
      }>())

      this.geo.geocode(Array.from(reqData.values())).subscribe(r => {
        this.dots = r;
        this.cdr.detectChanges();
      })
    })
  }
  createChart<T extends ChartType>(ctx: CanvasRenderingContext2D, config: ChartConfiguration<T>): Chart<T> {
    Chart.register(...registerables);
    return new Chart<T>(ctx, config);
  }
}
