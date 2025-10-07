import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardComponent } from '../../molecules/card/card.component';

@Component({
  selector: 'app-card-container',
  standalone: true,
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.scss',
  imports: [CardComponent],
})
export class CardContainerComponent {
  @Input() cards: {
    title: string;
    content: string;
    address: string;
    time: string;
    eventId?: string;
    day?: string;
  }[] = [];
  @Output() editEvent = new EventEmitter<string>();
  @Output() deleteEvent = new EventEmitter<string>();

  onEditEvent(eventId: string) {
    this.editEvent.emit(eventId);
  }

  onDeleteEvent(eventId: string) {
    this.deleteEvent.emit(eventId);
  }
}
