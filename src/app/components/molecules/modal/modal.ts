import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    //  close if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
