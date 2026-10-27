import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [],
  templateUrl: './loading-overlay.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loading-overlay.scss',
})
export class LoadingOverlay {
  constructor(public loadingService: LoadingService) {}
}
