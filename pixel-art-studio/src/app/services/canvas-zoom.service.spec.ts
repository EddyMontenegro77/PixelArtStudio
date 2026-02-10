import { TestBed } from '@angular/core/testing';

import { CanvasZoomService } from './canvas-zoom.service';

describe('CanvasZoomService', () => {
  let service: CanvasZoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasZoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
