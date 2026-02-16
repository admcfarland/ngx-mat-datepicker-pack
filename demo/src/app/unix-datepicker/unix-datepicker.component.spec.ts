
import { describe, it, expect, beforeEach } from 'vitest';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { UnixDatepickerComponent } from './unix-datepicker.component';

const DEBOUNCE_TIME_MS = 0;

describe('UnixDatepickerComponent with spectator', () => {
  let spectator: Spectator<UnixDatepickerComponent>;
  const createComponent = createComponentFactory({
    component: UnixDatepickerComponent,
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createComponent({
      props: { debounce: DEBOUNCE_TIME_MS }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  /* DEFAULT STATES */
  it('should have an empty initial value', () => {
    expect(spectator.component.timestampForm.value.timestamp).toBe('');
  });

  /* ERRORS */
  it('should show required error when empty and touched', () => {
    const control = spectator.component.timestampForm.controls.timestamp;
    control.markAsTouched();
    control.updateValueAndValidity();
    expect(spectator.component.errorMessage()).toMatch('Timestamp is required');
  });

  it('should show required error when 10-digit valud timestamp then delete one character then erase input', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('1771215930');
    control.markAsTouched();
    control.updateValueAndValidity();

    control.setValue('177121593');
    control.updateValueAndValidity();

    control.setValue('');
    control.updateValueAndValidity();
    expect(spectator.component.errorMessage()).toMatch('Timestamp is required');
  });

  it('should show pattern error for non-numeric input', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('abc');
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toMatch('Timestamp must be a number');
  });

  it('should show length error for wrong length', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('123456');
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toMatch('Timestamp must be exactly 10 or 13 digits');
  });

  it('should not show error for valid 10-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('1754039952');
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });

  it('should not show error for valid 13-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('1754039952000');
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });

  it('should not show error after alpha entry then valid 10-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue('abc');
    control.markAsTouched();
    control.updateValueAndValidity();

    control.setValue('1771215930');
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });

  /* OUTPUT EMISSION */
  it('should emit unixDateOutput when valid timestamp is entered', async () => {
    let output;
    const promise = new Promise<Date>(resolve => {
      spectator.output('unixDateOutput').subscribe(result => {
        output = result;
        resolve(result);
      });
    });

    const timestamp = '1771215930';
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(timestamp);
    control.markAsTouched();
    control.updateValueAndValidity();

    await promise;
    expect(output).not.toBeUndefined();
  });

  it('should emit unixDateOutput with correct date based on unix timestamp entered', async () => {
    let output;
    const promise = new Promise<Date>(resolve => {
      spectator.output('unixDateOutput').subscribe(result => {
        output = result;
        resolve(result);
      });
    });

    const timestamp = '1771215930';
    const parsedTs = parseInt(timestamp, 10);
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(timestamp);
    control.markAsTouched();
    control.updateValueAndValidity();

    await promise;
    expect(output).toEqual(new Date(parsedTs));
  });
});
