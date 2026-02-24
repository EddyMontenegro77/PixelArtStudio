import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLinkWithHref,
  RouterOutlet,
} from '@angular/router';
import { UserMenu } from './components/user-menu/user-menu';
import { LoadingOverlay } from './components/loading-overlay/loading-overlay';
import { LoadingService } from './services/loading.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserMenu, LoadingOverlay, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  hideAppHeader = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private authService: AuthService,
  ) {
    // Keep overlay visible on hard refresh until auth session is restored.
    this.loadingService.show();
    void this.authService.waitForAuthInitialization().finally(() => {
      this.loadingService.hide();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
        return;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();

        if (event instanceof NavigationEnd) {
          let current = this.route.firstChild;
          while (current?.firstChild) {
            current = current.firstChild;
          }
          this.hideAppHeader = current?.snapshot.data['hideAppHeader'] === true;
        }
      }
    });
  }
}
