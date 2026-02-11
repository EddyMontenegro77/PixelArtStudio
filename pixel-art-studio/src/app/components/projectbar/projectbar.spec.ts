import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projectbar } from './projectbar';

describe('Projectbar', () => {
  let component: Projectbar;
  let fixture: ComponentFixture<Projectbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projectbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projectbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
