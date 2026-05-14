import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteFinder } from './route-finder';

describe('RouteFinder', () => {
  let component: RouteFinder;
  let fixture: ComponentFixture<RouteFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteFinder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
