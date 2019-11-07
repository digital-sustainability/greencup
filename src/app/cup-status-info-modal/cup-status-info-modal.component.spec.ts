import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CupStatusInfoModalComponent } from './cup-status-info-modal.component';

describe('CupStatusInfoModalComponent', () => {
  let component: CupStatusInfoModalComponent;
  let fixture: ComponentFixture<CupStatusInfoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CupStatusInfoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CupStatusInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
