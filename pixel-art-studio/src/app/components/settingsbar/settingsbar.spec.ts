import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Settingsbar } from './settingsbar';

describe('Settingsbar', () => {
  let component: Settingsbar;
  let fixture: ComponentFixture<Settingsbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settingsbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Settingsbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
