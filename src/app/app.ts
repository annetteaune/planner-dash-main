import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/organisms/header/header.component';
import { FooterComponent } from './components/organisms/footer/footer.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'planner-dash';

  private themeService = inject(ThemeService);
}
