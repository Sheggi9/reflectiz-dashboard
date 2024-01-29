import { TestBed } from '@angular/core/testing';

import { AnalyticsDashboardService } from './analytics-dashboard.service';

describe('AnalyticsDashboardService', () => {
  let service: AnalyticsDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
