import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolItem } from './tool-item';

describe('ToolItem', () => {
  let component: ToolItem;
  let fixture: ComponentFixture<ToolItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
