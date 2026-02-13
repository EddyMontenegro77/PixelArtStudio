import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationPreview } from './animation-preview';

describe('AnimationPreview', () => {
  let component: AnimationPreview;
  let fixture: ComponentFixture<AnimationPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimationPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
