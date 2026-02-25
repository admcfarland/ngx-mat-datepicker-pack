import { Component } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unix-datepicker-3',
  imports: [ReactiveFormsModule],
  templateUrl: './unix-datepicker-3.component.html',
  styleUrl: './unix-datepicker-3.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UnixDatepicker3Component,
      multi: true,
    }
  ],
})
export class UnixDatepicker3Component implements ControlValueAccessor {
  // Internal component value.
  protected internalControl = new FormControl<string>('', { nonNullable: true });

  // Component states.
  private _touched = false;

  // ControlValueAccessor.
  protected _onChange: (value: Date | null) => void = () => { };
  protected _onTouched: () => void = () => { };

  writeValue(parentGivenValue: string): void {
    this.internalControl.setValue(parentGivenValue);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Denote side effect usage only and discard returned void from methods.
    void (isDisabled ? this.internalControl.disable() : this.internalControl.enable());
  }

  constructor() {
    this.internalControl.valueChanges.subscribe(val => {
      const parsed = this._parse(val);
      this._onChange(parsed);
    });
  }

  /**
   * Parses user input into Number to create Date object.
   * Normalizes 10 digit strings, seconds, into 13 digits, milliseconds.
   * @param raw User input string.
   * @returns A Date object or null.
   */
  private _parse(raw: string): Date | null {
    if (!this._isValidTimestampString(raw)) {
      return null;
    }

    const num = Number(raw);

    // Normalize time to milliseconds.
    const ms = (raw.length) === 10 ? num * 1000 : num;
    const date = new Date(ms);

    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Validates string is digit only and of length 10 (seconds) or 13 (milliseconds).
   * @param raw User input string.
   * @returns Boolean.
   */
  private _isValidTimestampString(raw: string): boolean {
    return /^\d{10}$/.test(raw) || /^\d{13}$/.test(raw);
  }
}
