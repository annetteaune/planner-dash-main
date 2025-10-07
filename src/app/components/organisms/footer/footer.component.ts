import { Component } from '@angular/core';
import { PageTitleComponent } from '../../atoms/page-title/page-title.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [PageTitleComponent],
})
export class FooterComponent {}
