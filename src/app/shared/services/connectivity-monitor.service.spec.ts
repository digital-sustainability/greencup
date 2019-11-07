import { TestBed } from '@angular/core/testing';

import { ConnectivityMonitorService } from './connectivity-monitor.service';

describe('ConnectivityMonitorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConnectivityMonitorService = TestBed.get(ConnectivityMonitorService);
    expect(service).toBeTruthy();
  });
});
