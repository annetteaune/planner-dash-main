import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() id = '';
  @Input() name = '';
  @Input() checked = false;
  @Output() change = new EventEmitter<boolean>();

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(checked: boolean): void {
    this.checked = checked;
    this.onChange(checked);
    this.onTouched();
    this.change.emit(checked);
  }
}
