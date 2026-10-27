import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layer } from './layer';

describe('Layer', () => {
  let component: Layer;
  let fixture: ComponentFixture<Layer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layer);
    fixture.componentRef.setInput('layerName', 'Layer 1');
    fixture.componentRef.setInput('layerId', 1);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
