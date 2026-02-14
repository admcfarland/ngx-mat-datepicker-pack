import { Component } from '@angular/core';
import { UnixDatepickerComponent } from './unix-datepicker/unix-datepicker.component';

@Component({
  selector: 'app-root',
  imports: [UnixDatepickerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo';

  unixTimestampConversion = '';

  updateDateTime(newDateTime: string): void {
    this.unixTimestampConversion = newDateTime;
  }
}
