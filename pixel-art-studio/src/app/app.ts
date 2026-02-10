import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Editor } from './pages/editor/editor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Editor],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pixel-art-studio');
}
