import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Framesbar } from './framesbar';

describe('Framesbar', () => {
  let component: Framesbar;
  let fixture: ComponentFixture<Framesbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Framesbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Framesbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
