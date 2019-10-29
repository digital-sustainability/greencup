import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutModalComponent } from './payout-modal.component';

describe('PayoutModalComponent', () => {
  let component: PayoutModalComponent;
  let fixture: ComponentFixture<PayoutModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayoutModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
