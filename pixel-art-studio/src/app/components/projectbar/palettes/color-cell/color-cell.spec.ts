import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorCell } from './color-cell';

describe('ColorCell', () => {
  let component: ColorCell;
  let fixture: ComponentFixture<ColorCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorCell);
    fixture.componentRef.setInput('color', '#000000');
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('isSelected', false);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
