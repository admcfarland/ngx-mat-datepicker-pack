
import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('should have an empty initial value', () => {
    expect(spectator.component.timestampForm.value.timestamp).toBe('');
  });

  it('should show required error when empty and touched', () => {
    const control = spectator.component.timestampForm.controls.timestamp;
    control.markAsTouched();
    control.updateValueAndValidity();
    expect(spectator.component.errorMessage()).toMatch('Timestamp is required');
  });

  it('should show pattern error for non-numeric input', () => {
    vi.useFakeTimers();

    const control = spectator.component.timestampForm.controls.timestamp;
    control.setValue('abc');
    control.markAsTouched();
    control.updateValueAndValidity();

    vi.advanceTimersByTime(DEBOUNCE_TIME_MS);
    expect(spectator.component.errorMessage()).toMatch('Timestamp must be a number');

    vi.useRealTimers();
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

  // it('should emit dateTimeOutput when valid timestamp is entered', () => {
  //   const emitSpy = vi.fn();
  //   spectator.component.dateTimeOutput.subscribe(emitSpy);
  //   const control = spectator.component.timestampForm.controls.timestamp;
  //   control.setValue('1754039952');
  //   control.markAsTouched();
  //   control.updateValueAndValidity();
  //   // Manually trigger the effect
  //   spectator.component.dateTimeString();
  //   expect(emitSpy).toHaveBeenCalled();
  //   expect(emitSpy.mock.calls[0][0]).toMatch(/20\d{2}/); // Should contain a year string
  // });
});
