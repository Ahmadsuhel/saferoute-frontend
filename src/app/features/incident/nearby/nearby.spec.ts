import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nearby } from './nearby';

describe('Nearby', () => {
  let component: Nearby;
  let fixture: ComponentFixture<Nearby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nearby]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nearby);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
