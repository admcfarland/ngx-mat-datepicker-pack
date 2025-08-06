import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, map } from 'rxjs';

// Custom length validator.
function timestampLengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const length = value.toString().length;
    const isValid = length === 10 || length === 13;

    return isValid ? null : { timestampLength: true };
  };
}

@Component({
  selector: 'app-unix-datepicker',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInputModule, CommonModule],
  templateUrl: './unix-datepicker.component.html',
  styleUrl: './unix-datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnixDatepickerComponent {
  // Component inputs.
  appearance = input<MatFormFieldAppearance>('fill');
  label = input<string>('Unix')
  placeholder = input<string>('Enter 10 or 13 digit timestamp');
  useGMT = input(false, {
    transform: (v: string | boolean) => typeof v === 'string' ? v === 'true' : v
  });
  debounce = input<number>(250);
  dateFormat = input<Intl.DateTimeFormatOptions>({
    dateStyle: 'medium'
  });

  // User input.
  timestampForm = new FormGroup({
    timestamp: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
      timestampLengthValidator()
    ])
  });

  // Signal conversions.
  private readonly _timestampSignal = toSignal(
    // Explicit Observable dependency on which to create signal.
    this.timestampForm.controls.timestamp.valueChanges.pipe(
      debounceTime(this.debounce()),
      map(v => v && (v.length === 10 || v.length === 13) ? parseInt(v, 10) : undefined)
    )
  );
  private readonly _controlStatus = toSignal(
    this.timestampForm.controls.timestamp.statusChanges.pipe(
      debounceTime(this.debounce())
    )
  );

  // Computed signals.
  protected readonly errorMessage = computed(() => {
    // Causes a recomputation.
    this._timestampSignal();
    this._controlStatus();
    // Fires based on changes in error object of AbstractControl.
    const control = this.timestampForm.controls.timestamp;
    if (control.hasError('required')) {
      return 'Timestamp is required';
    }
    if (control.hasError('pattern')) {
      return 'Timestamp must be a number';
    }
    if (control.hasError('timestampLength')) {
      return 'Timestamp must be exactly 10 or 13 digits';
    }
    return '';
  })

  protected readonly dateTimeString = computed(() => {
    // Fires when timestamp FormControl value changes.
    const timestamp = this._timestampSignal();
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return date.toLocaleString(
      undefined,
      {
        ...this.dateFormat(),
        timeZone: this.useGMT() ? 'GMT' : undefined
      }
    );
  });

  // Component outputs.
  dateTimeOutput = output<string>();

  constructor() {
    effect(() => {
      const dateString = this.dateTimeString();
      if (dateString) {
        this.dateTimeOutput.emit(dateString);
      }
    });
  }
}
