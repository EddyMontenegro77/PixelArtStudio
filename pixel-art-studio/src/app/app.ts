import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLinkWithHref,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserMenu } from './components/user-menu/user-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserMenu, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  hideAppHeader = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let current = this.route.firstChild;
      while (current?.firstChild) {
        current = current.firstChild;
      }
      this.hideAppHeader = current?.snapshot.data['hideAppHeader'] === true;
    });
  }
}
