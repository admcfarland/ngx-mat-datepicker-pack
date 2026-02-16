import { Component, inject } from '@angular/core';
import { UnixDatepickerComponent } from './unix-datepicker/unix-datepicker.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [UnixDatepickerComponent],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Title vars.
  title = 'demo';

  // Pipe vars.
  datePipe = inject(DatePipe);

  // Output storage vars.
  unixTimestampConversion!: string | null;

  /**
   * Receives the output from UnixDatepicker component and sets the associated output variable.
   * @param newDate Date object.
   */
  unixOutput(newDate: Date): void {
    this.unixTimestampConversion = this._formatExampleOutput(newDate);
  }

  /**
   * Format Date object input to look something like "2026-02-15 10:23:51.000".
   * @param date Date object.
   * @returns Result of DatePipe transform.
   */
  private _formatExampleOutput(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss.SSS z', '+0');
  }
}
