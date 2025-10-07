import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-title',
  standalone: true,
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss',
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() type: 'maintitle' | 'subtitle' = 'subtitle'; // = means default value
}
