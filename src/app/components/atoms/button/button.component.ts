import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  imports: [NgIcon],
})
export class ButtonComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() ariaLabel: string = '';
  @Input() dateBtn: boolean = false;
  @Input() disabled: boolean = false;
  @Input() active: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() click = new EventEmitter<void>();

  protected handleClick(event: Event) {
    event.stopPropagation();
    //event.preventDefault();
    if (!this.disabled) {
      this.click.emit();
    }
  }
}
