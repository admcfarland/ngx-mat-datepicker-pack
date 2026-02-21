import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, map } from 'rxjs';

const DEBOUNCE_TIME_MS = 0;

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
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInputModule, CommonModule],
  templateUrl: './unix-datepicker.component.html',
  styleUrl: './unix-datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnixDatepickerComponent {
  // Component inputs.
  appearance = input<MatFormFieldAppearance>('fill');
  label = input<string>('Unix');
  placeholder = input<string>('Enter 10 or 13 digit timestamp');
  debounce = input<number>(DEBOUNCE_TIME_MS);

  // User input.
  timestampForm = new FormGroup({
    timestamp: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
      timestampLengthValidator()
    ])
  });

  // Signal conversions.
  private readonly _rawTimestampSignal = toSignal(
    this.timestampForm.controls.timestamp.valueChanges.pipe(
      debounceTime(this.debounce())
    )
  );
  private readonly _timestampSignal = toSignal(
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
  readonly errorMessage = computed(() => {
    // Causes a recomputation on input change.
    this._rawTimestampSignal();
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
  });

  readonly convertedDate = computed(() => {
    // Fires when timestamp FormControl value changes.
    const timestamp = this._timestampSignal();
    if (!timestamp) return '';

    return new Date(timestamp);
  });

  // Component outputs.
  unixDateOutput = output<Date>();

  constructor() {
    effect(() => {
      const dateString = this.convertedDate();
      if (dateString) {
        this.unixDateOutput.emit(dateString);
      }
    });
  }
}
