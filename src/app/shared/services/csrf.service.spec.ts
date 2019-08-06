import { TestBed } from '@angular/core/testing';

import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CsrfService = TestBed.get(CsrfService);
    expect(service).toBeTruthy();
  });
});
