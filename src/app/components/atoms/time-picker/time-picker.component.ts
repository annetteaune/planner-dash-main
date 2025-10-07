import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [
    FormsModule,
    MatTimepickerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent implements ControlValueAccessor {
  @Input() label = 'Time';
  @Input() disabled = false;
  @Input() required = false;

  value: Date | null = null;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Date | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(): void {
    this.onChange(this.value);
    this.onTouched();
  }
}
