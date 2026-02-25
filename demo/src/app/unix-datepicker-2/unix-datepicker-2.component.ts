import {
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'app-unix-datepicker-2',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <input
      #inputEl
      [formControl]="internalControl"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (blur)="_onTouched(); onBlur()"
      (focus)="onFocus()"
      type="text"
      inputmode="numeric"
      autocomplete="off"
    />
  `,
  styles: [`
    input {
      border: none;
      outline: none;
      background: transparent;
      width: 100%;
      font: inherit;
      color: inherit;
    }
  `],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: UnixDatepicker2Component,
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UnixDatepicker2Component,
      multi: true,
    },
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: UnixDatepicker2Component,
    //   multi: true,
    // },
  ],
})
export class UnixDatepicker2Component
  implements MatFormFieldControl<Date>, ControlValueAccessor, Validator, OnInit, OnDestroy {
  // ─── MatFormFieldControl bookkeeping ────────────────────────────────────────

  static nextId = 0;

  readonly stateChanges = new Subject<void>();
  readonly id = `unix-datepicker-${UnixDatepicker2Component.nextId++}`;
  readonly controlType = 'unix-datepicker';

  focused = false;
  touched = false;

  // ─── Injections ─────────────────────────────────────────────────────────────

  /** Gives us access to the parent FormControl so errorState reflects reality */
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly focusMonitor = inject(FocusMonitor);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  // ─── Internal state ──────────────────────────────────────────────────────────

  /** The raw string the user is typing */
  readonly internalControl = new FormControl<string>('', { nonNullable: true });

  /** The resolved Date value — null means nothing valid yet */
  private _value: Date | null = null;

  // ─── CVA callbacks ───────────────────────────────────────────────────────────

  _onChange: (value: Date | null) => void = () => { };
  _onTouched: () => void = () => { };

  // ─── MatFormFieldControl: required inputs ────────────────────────────────────

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(val: string) {
    this._placeholder = val;
    this.stateChanges.next();
  }
  private _placeholder = '10 or 13 digit unix timestamp';

  @Input()
  get required(): boolean { return this._required; }
  set required(val: boolean) {
    this._required = val;
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(val: boolean) {
    this._disabled = val;
    val ? this.internalControl.disable() : this.internalControl.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  // ─── MatFormFieldControl: derived state ──────────────────────────────────────

  get value(): Date | null { return this._value; }

  get empty(): boolean { return !this.internalControl.value; }

  get shouldLabelFloat(): boolean { return this.focused || !this.empty; }

  get errorState(): boolean {
    // surface errors once the field has been touched
    return (this.ngControl?.invalid ?? false) && this.touched;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  constructor() {
    // Subscribe to raw input changes and attempt to parse on every keystroke
    this.internalControl.valueChanges.subscribe((raw) => {
      const parsed = this.parse(raw);
      this._value = parsed;
      this._onChange(parsed);
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    if (this.ngControl?.control) {
      this.ngControl.control.addValidators(this.validate.bind(this));
      this.ngControl.control.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  // ─── MatFormFieldControl: required methods ───────────────────────────────────

  onContainerClick(): void {
    this.inputEl?.nativeElement.focus();
  }

  setDescribedByIds(ids: string[]): void {
    this.inputEl?.nativeElement.setAttribute('aria-describedby', ids.join(' '));
  }

  // ─── ControlValueAccessor ────────────────────────────────────────────────────

  /** Called by Angular to push a value INTO the component (e.g. patchValue) */
  writeValue(value: Date | null): void {
    if (value instanceof Date && !isNaN(value.getTime())) {
      // Write back as a 13-digit ms timestamp so the input reflects the value
      this.internalControl.setValue(String(value.getTime()), { emitEvent: false });
      this._value = value;
    } else {
      this.internalControl.setValue('', { emitEvent: false });
      this._value = null;
    }
    this.stateChanges.next();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ─── Validator ───────────────────────────────────────────────────────────────

  validate(control: AbstractControl): ValidationErrors | null {
    const raw = this.internalControl.value;
    if (!raw) return null; // empty is handled by Validators.required if needed

    if (!this.isValidTimestampString(raw)) {
      return { invalidTimestamp: { value: raw, hint: 'Must be a 10 or 13 digit number' } };
    }

    return null;
  }

  // ─── Focus tracking ──────────────────────────────────────────────────────────

  onFocus(): void {
    this.focused = true;
    this.stateChanges.next();
  }

  onBlur(): void {
    this.focused = false;
    this.touched = true;
    this.stateChanges.next();
  }

  // ─── Parsing logic ───────────────────────────────────────────────────────────

  private parse(raw: string): Date | null {
    if (!this.isValidTimestampString(raw)) return null;

    const num = Number(raw);

    // 10-digit = seconds, normalize to ms
    const ms = raw.length === 10 ? num * 1000 : num;
    const date = new Date(ms);

    return isNaN(date.getTime()) ? null : date;
  }

  private isValidTimestampString(raw: string): boolean {
    // Must be only digits, either 10 or 13 characters long
    return /^\d{10}$/.test(raw) || /^\d{13}$/.test(raw);
  }
}