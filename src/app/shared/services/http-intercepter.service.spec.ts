import { TestBed } from '@angular/core/testing';

import { HttpIntercepterService } from './http-intercepter.service';

describe('HttpIntercepterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpIntercepterService = TestBed.get(HttpIntercepterService);
    expect(service).toBeTruthy();
  });
});
