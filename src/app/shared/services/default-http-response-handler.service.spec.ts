import { TestBed } from '@angular/core/testing';

import { DefaultHttpResponseHandlerService } from './default-http-response-handler.service';

describe('DefaultHttpResponseHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DefaultHttpResponseHandlerService = TestBed.get(DefaultHttpResponseHandlerService);
    expect(service).toBeTruthy();
  });
});
