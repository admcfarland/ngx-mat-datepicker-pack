import { Component, inject } from '@angular/core';
import { MdpUnixDatepicker } from 'ngx-mat-datepicker-pack';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnixDatepicker3Component } from './unix-datepicker-3/unix-datepicker-3.component';
import { map } from 'rxjs';
// import { debounceTime } from 'rxjs';

// const DEBOUNCE_TIME_MS = 0;

@Component({
  selector: 'app-root',
  imports: [MdpUnixDatepicker, MatFormFieldModule, ReactiveFormsModule, UnixDatepicker3Component],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // Title vars.
  title = 'demo';

  // Pipe vars.
  datePipe = inject(DatePipe);

  // Output storage vars.
  unixTimestampConversion!: string;

  // Unix FC.
  current = new Date().getTime().toString();
  unixDateControl = new FormControl<string>(this.current, [Validators.required]);

  constructor() {
    this.unixDateControl.valueChanges.pipe(
      map((value: string | null) => value || '')
    ).subscribe(dateStr =>
      this.unixTimestampConversion = this._formatExampleOutput(dateStr)
    );

    // Convert initial values.
    this._setInitialDates();
  }

  /**
   * Set initial demo values.
   */
  private _setInitialDates(): void {
    const initialUnixConversionStr = new Date(Number(this.unixDateControl.value)!).toString();
    this.unixTimestampConversion = this._formatExampleOutput(initialUnixConversionStr);
  }

  /**
   * Format Date object input to look something like "2026-02-15 10:23:51.000".
   * @param date Date object.
   * @returns Result of DatePipe transform or 'Invalid Date'.
   */
  private _formatExampleOutput(dateStr: string): string {
    return this.unixDateControl.valid ?
      this.datePipe.transform(dateStr, 'yyyy-MM-dd hh:mm:ss.SSS', '+0')! :
      'Invalid Date';
  }
}
