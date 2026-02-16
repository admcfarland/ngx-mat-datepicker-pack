import { describe, it, expect, beforeEach } from 'vitest';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { UnixDatepickerComponent } from './unix-datepicker.component';
import { MatFormField } from '@angular/material/form-field';

const VALID_TEN_DIGIT = '1771215930';
const VALID_THIRTEEN_DIGIT = '1754039952000';

const PARSED_VALID_TEN_DIGIT = parseInt(VALID_TEN_DIGIT, 10);

const INVALID_ALPHA_ENTRY = 'abc';
const INVALID_LENGTH_DIGIT = '123456';
const INVALID_DIGIT_WITH_SPACES = ' 1771215930 ';

describe('UnixDatepickerComponent creation (spectator)', () => {
  let spectator: Spectator<UnixDatepickerComponent>;
  const createComponent = createComponentFactory({
    component: UnixDatepickerComponent,
    detectChanges: false,
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should have an empty initial value', () => {
    expect(spectator.component.timestampForm.value.timestamp).toBe('');
  });

  it('should have error required on initial construction', () => {
    expect(spectator.component.errorMessage()).toBe('Timestamp is required');
  });
});

describe('UnixDatepickerComponent errors (spectator)', () => {
  let spectator: Spectator<UnixDatepickerComponent>;
  const createComponent = createComponentFactory({
    component: UnixDatepickerComponent,
    detectChanges: false,
  });

  beforeEach(() => spectator = createComponent());

  it('should show required error when empty and touched', () => {
    const control = spectator.component.timestampForm.controls.timestamp;
    control.markAsTouched();
    control.updateValueAndValidity();
    expect(spectator.component.errorMessage()).toMatch('Timestamp is required');
  });

  it('should show required error when 10-digit valud timestamp then delete one character then erase input', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(VALID_TEN_DIGIT);
    control.markAsTouched();
    control.updateValueAndValidity();

    control.setValue(INVALID_LENGTH_DIGIT);
    control.updateValueAndValidity();

    control.setValue('');
    control.updateValueAndValidity();
    expect(spectator.component.errorMessage()).toMatch('Timestamp is required');
  });

  it('should show pattern error for non-numeric input', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(INVALID_ALPHA_ENTRY);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toMatch('Timestamp must be a number');
  });

  it('should show pattern error for timestamp with spaces', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(INVALID_DIGIT_WITH_SPACES);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toMatch('Timestamp must be a number');
  });

  it('should show length error for wrong length', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(INVALID_LENGTH_DIGIT);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toMatch('Timestamp must be exactly 10 or 13 digits');
  });

  it('should not show error for valid 10-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(VALID_TEN_DIGIT);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });

  it('should not show error for valid 13-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(VALID_THIRTEEN_DIGIT);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });

  it('should not show error after alpha entry then valid 10-digit timestamp', () => {
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(INVALID_ALPHA_ENTRY);
    control.markAsTouched();
    control.updateValueAndValidity();

    control.setValue(VALID_TEN_DIGIT);
    control.updateValueAndValidity();

    expect(spectator.component.errorMessage()).toBe('');
  });
});

describe('UnixDatepickerComponent inputs (spectator)', () => {
  let spectator: Spectator<UnixDatepickerComponent>;
  const createComponent = createComponentFactory(UnixDatepickerComponent);

  beforeEach(() => spectator = createComponent());

  it('should render the correct placeholder', () => {
    spectator.setInput('placeholder', 'Test Placeholder');
    spectator.detectChanges();
    const input = spectator.query('input[matInput]');
    expect(input?.getAttribute('placeholder')).toBe('Test Placeholder');
  });

  it('should render the correct label', () => {
    spectator.setInput('label', 'Test Label');
    spectator.detectChanges();
    const label = spectator.query('mat-label');
    expect(label?.textContent).toContain('Test Label');
  });

  it('should render the correct appearance', () => {
    spectator.setInput('appearance', 'outline');
    spectator.detectChanges();
    const formField = spectator.query(MatFormField);
    expect(formField?.appearance).toBe('outline');
  });
});

describe('UnixDatepickerComponent output (spectator)', () => {
  let spectator: Spectator<UnixDatepickerComponent>;
  const createComponent = createComponentFactory(UnixDatepickerComponent);

  beforeEach(() => spectator = createComponent());

  it('should emit unixDateOutput when valid timestamp is entered', async () => {
    let output;
    const promise = new Promise<Date>(resolve => {
      spectator.output('unixDateOutput').subscribe(result => {
        output = result;
        resolve(result);
      });
    });

    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(VALID_TEN_DIGIT);
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

    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(VALID_TEN_DIGIT);
    control.markAsTouched();
    control.updateValueAndValidity();

    await promise;
    expect(output).toEqual(new Date(PARSED_VALID_TEN_DIGIT));
  });

  it('should not emit output if input is invalid', async () => {
    vi.useFakeTimers();
    let emitted = false;
    spectator.output('unixDateOutput').subscribe(() => emitted = true);
    const control = spectator.component.timestampForm.controls.timestamp;

    control.setValue(INVALID_ALPHA_ENTRY);
    control.markAsTouched();
    control.updateValueAndValidity();

    await vi.runAllTimersAsync();
    expect(emitted).toBe(false);
    vi.useRealTimers();
  });
});
