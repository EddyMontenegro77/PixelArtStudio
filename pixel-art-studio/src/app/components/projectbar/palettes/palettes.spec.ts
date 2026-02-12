import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Palettes } from './palettes';

describe('Palettes', () => {
  let component: Palettes;
  let fixture: ComponentFixture<Palettes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Palettes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Palettes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
