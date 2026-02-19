import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { UserMenu } from './components/user-menu/user-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserMenu, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pixel-art-studio');
}
