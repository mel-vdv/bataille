import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebutComponent } from './debut.component';

describe('DebutComponent', () => {
  let component: DebutComponent;
  let fixture: ComponentFixture<DebutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
