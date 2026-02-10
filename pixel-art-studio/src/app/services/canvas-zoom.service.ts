import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanvasZoomService {
  private pixelSizeSubject = new BehaviorSubject<number>(8);
  pixelSize$ = this.pixelSizeSubject.asObservable();

  private minPixelSize: number = 2;
  private maxPixelSize: number = 80;

  zoom(deltaY: number): number {
    const direction = Math.sign(deltaY);
    const nextPixelSize = this.pixelSizeSubject.value - direction;
    const clamped = Math.max(this.minPixelSize, Math.min(this.maxPixelSize, nextPixelSize));
    if (clamped !== this.pixelSizeSubject.value) {
      this.pixelSizeSubject.next(clamped);
    }
    return clamped;
  }

  setPixelSize(size: number): void {
    this.pixelSizeSubject.next(size);
  }
}
