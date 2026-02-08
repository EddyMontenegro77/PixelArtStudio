import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Grid } from './components/grid/grid';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Grid],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pixel-art-studio');
}
