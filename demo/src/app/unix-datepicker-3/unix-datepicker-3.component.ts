import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, inject, Input, OnDestroy, ViewChild, OnInit, HostBinding } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

// Invalid Date object to be returned on validation failure.
// Prevents component from mistaking null for required validation.
const INVALID_DATE = new Date(NaN);

@Component({
  selector: 'app-unix-datepicker-3',
  imports: [ReactiveFormsModule],
  templateUrl: './unix-datepicker-3.component.html',
  styleUrl: './unix-datepicker-3.component.scss',
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: UnixDatepicker3Component
    },
  ],
})
export class UnixDatepicker3Component implements ControlValueAccessor, MatFormFieldControl<Date>, OnDestroy, OnInit {
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLElement>;

  // Internal component vars.
  protected readonly internalControl = new FormControl<string>('', { nonNullable: true });
  private _value = INVALID_DATE;

  // Component state vars.
  private _touched = false;
  focused = false;

  // Accessibility vars.
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  // ControlValueAccessor.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onChange: (value: Date | null) => void = () => { };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onTouched: () => void = () => { };

  writeValue(parentGivenValue: string): void {
    this.internalControl.setValue(parentGivenValue);
    this.stateChanges.next();
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

  // MatFormFieldControl.
  readonly stateChanges = new Subject<void>();

  static nextId = 0;
  readonly id = `unix-datepicker-${UnixDatepicker3Component.nextId++}`;

  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly controlType = 'unix-datepicker';

  get value(): Date {
    return this._value;
  }
  get empty(): boolean {
    return this.internalControl.value.length === 0;
  }
  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }
  get errorState(): boolean {
    return (this.ngControl?.invalid ?? false) && this._touched;
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(newPlaceholder) {
    this._placeholder = newPlaceholder;
    this.stateChanges.next();
  }
  private _placeholder = '10 or 13 digit unix timestamp';

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(newRequired: boolean) {
    this._required = newRequired;
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(newDisabled: boolean) {
    this._disabled = newDisabled;
    this.setDisabledState(newDisabled);
    this.stateChanges.next();
  }
  private _disabled = false;

  setDescribedByIds(ids: string[]): void {
    this.inputRef?.nativeElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(): void {
    this.inputRef?.nativeElement.focus();
  }

  constructor() {
    this.internalControl.valueChanges.subscribe(value => {
      if (!value) {
        this._onChange(null);
      } else {
        const parsed = this._parse(value);
        this._value = parsed;
        this._onChange(parsed ?? INVALID_DATE);
      }
      this.stateChanges.next();
    });

    // Replace the provider from above with this.
    if (this.ngControl !== null) {
      // Setting the value accessor directly (instead of using the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      this.ngControl.control.addValidators(this._validate.bind(this));
      this.ngControl.control.updateValueAndValidity();
    }
  }

  protected onFocus() {
    this.focused = true;
    this.stateChanges.next();
  }

  protected onBlur() {
    this._touched = true;
    this.focused = false;
    this._onTouched();
    this.stateChanges.next();
  }

  private _validate(): ValidationErrors | null {
    const raw = this.internalControl.value;

    // empty is handled by Validators.required if needed
    if (!raw) return null;

    return this._isValidTimestampString(raw) ? INVALID_DATE : { invalidTimestamp: true };
  }

  /**
   * Parses user input into Number to create Date object.
   * Normalizes 10 digit strings, seconds, into 13 digits, milliseconds.
   * @param raw User input string.
   * @returns A Date object: an invalid Date object on validation failure and a valid one on success.
   */
  private _parse(raw: string): Date {
    if (!this._isValidTimestampString(raw)) {
      return INVALID_DATE;
    }

    const num = Number(raw);

    // Normalize time to milliseconds.
    const ms = (raw.length) === 10 ? num * 1000 : num;
    const date = new Date(ms);

    return isNaN(date.getTime()) ? INVALID_DATE : date;
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
