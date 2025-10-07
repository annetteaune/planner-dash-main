import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { provideIcons } from '@ng-icons/core';
import {
  matEditOutline,
  matDeleteOutline,
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [ButtonComponent],
  viewProviders: [provideIcons({ matEditOutline, matDeleteOutline })],
})
export class CardComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() address: string = '';
  @Input() time: string = '';
  @Input() eventId: string = '';
  @Input() day?: string;
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();

  onEdit() {
    this.editClick.emit(this.eventId);
  }

  onDelete() {
    this.deleteClick.emit(this.eventId);
  }
}
