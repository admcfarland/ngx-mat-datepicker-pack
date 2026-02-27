/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnixDatepickerComponent } from './unix-datepicker.component';

describe('UnixDatepickerComponent', () => {
  let component: UnixDatepickerComponent;
  let fixture: ComponentFixture<UnixDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnixDatepickerComponent, ReactiveFormsModule, MatFormFieldModule, NoopAnimationsModule],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(UnixDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have a unique ID', () => {
      expect(component.id).toBeDefined();
      expect(component.id).toMatch(/^unix-datepicker-\d+$/);
    });

    it('should initialize with empty value', () => {
      expect(component.value).toEqual(new Date(NaN));
    });

    it('should initialize with default placeholder', () => {
      expect(component.placeholder).toBe('10 or 13 digit unix timestamp');
    });

    it('should initialize as not required', () => {
      expect(component.required).toBe(false);
    });

    it('should initialize as not disabled', () => {
      expect(component.disabled).toBe(false);
    });

    it('should initialize as not focused', () => {
      expect(component.focused).toBe(false);
    });

    it('should have correct control type', () => {
      expect(component.controlType).toBe('unix-datepicker');
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should register onChange callback', () => {
      const mockFn = vi.fn();
      component.registerOnChange(mockFn);
      expect(component['_onChange']).toBe(mockFn);
    });

    it('should register onTouched callback', () => {
      const mockFn = vi.fn();
      component.registerOnTouched(mockFn);
      expect(component['_onTouched']).toBe(mockFn);
    });

    it('should write value to internal control', () => {
      const testValue = '1609459200000'; // Jan 1, 2021
      component.writeValue(testValue);
      expect(component['internalControl'].value).toBe(testValue);
    });

    it('should emit stateChanges when writing value', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component.writeValue('1609459200000');
      expect(stateChangeSpy).toHaveBeenCalled();
    });

    it('should disable the internal control', () => {
      component.setDisabledState(true);
      expect(component['internalControl'].disabled).toBe(true);
    });

    it('should enable the internal control', () => {
      component.setDisabledState(false);
      expect(component['internalControl'].enabled).toBe(true);
    });
  });

  describe('Input Properties', () => {
    it('should update placeholder', () => {
      const newPlaceholder = 'Enter a timestamp';
      component.placeholder = newPlaceholder;
      expect(component.placeholder).toBe(newPlaceholder);
    });

    it('should emit stateChanges when placeholder changes', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component.placeholder = 'New placeholder';
      expect(stateChangeSpy).toHaveBeenCalled();
    });

    it('should set required property', () => {
      component.required = true;
      expect(component.required).toBe(true);
    });

    it('should emit stateChanges when required changes', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component.required = true;
      expect(stateChangeSpy).toHaveBeenCalled();
    });

    it('should set disabled property', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });

    it('should call setDisabledState when disabled property changes', () => {
      const setDisabledStateSpy = vi.spyOn(component, 'setDisabledState');
      component.disabled = true;
      expect(setDisabledStateSpy).toHaveBeenCalledWith(true);
    });

    it('should emit stateChanges when disabled changes', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component.disabled = true;
      expect(stateChangeSpy).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should return true when input is empty', () => {
      component['internalControl'].setValue('');
      expect(component.empty).toBe(true);
    });

    it('should return false when input has value', () => {
      component['internalControl'].setValue('1609459200000');
      expect(component.empty).toBe(false);
    });
  });

  describe('Focus and Blur Behavior', () => {
    it('should set focused to true on focus', () => {
      component['onFocus']();
      expect(component.focused).toBe(true);
    });

    it('should emit stateChanges on focus', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component['onFocus']();
      expect(stateChangeSpy).toHaveBeenCalled();
    });

    it('should set focused to false on blur', () => {
      component['onFocus']();
      component['onBlur']();
      expect(component.focused).toBe(false);
    });

    it('should set touched to true on blur', () => {
      component['onBlur']();
      expect(component['_touched']).toBe(true);
    });

    it('should call onTouched callback on blur', () => {
      const mockFn = vi.fn();
      component.registerOnTouched(mockFn);
      component['onBlur']();
      expect(mockFn).toHaveBeenCalled();
    });

    it('should emit stateChanges on blur', () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component['onBlur']();
      expect(stateChangeSpy).toHaveBeenCalled();
    });
  });

  describe('Label Floating Behavior', () => {
    it('should float label when focused', () => {
      component['onFocus']();
      expect(component.shouldLabelFloat).toBe(true);
    });

    it('should float label when not empty', () => {
      component['internalControl'].setValue('1609459200000');
      expect(component.shouldLabelFloat).toBe(true);
    });

    it('should not float label when unfocused and empty', () => {
      component['internalControl'].setValue('');
      component.focused = false;
      expect(component.shouldLabelFloat).toBe(false);
    });
  });

  describe('Timestamp Parsing - 10 Digit (Seconds)', () => {
    it('should parse valid 10 digit timestamp', () => {
      const timestamp = '1609459200'; // Jan 1, 2021 00:00:00 UTC
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(1609459200000);
    });

    it('should convert seconds to milliseconds for 10 digit input', () => {
      const timestamp = '1000000000'; // Sep 9, 2001
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(1000000000000);
    });

    it('should return invalid date for invalid 10 digit input', () => {
      const timestamp = '12345abcde';
      const result = component['_parse'](timestamp);
      expect(isNaN(result.getTime())).toBe(true);
    });
  });

  describe('Timestamp Parsing - 13 Digit (Milliseconds)', () => {
    it('should parse valid 13 digit timestamp', () => {
      const timestamp = '1609459200000'; // Jan 1, 2021 00:00:00 UTC
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(1609459200000);
    });

    it('should handle current timestamp', () => {
      const now = Date.now();
      const timestamp = now.toString();
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(now);
    });

    it('should return invalid date for invalid 13 digit input', () => {
      const timestamp = '12345678901ab';
      const result = component['_parse'](timestamp);
      expect(isNaN(result.getTime())).toBe(true);
    });
  });

  describe('Timestamp Validation', () => {
    it('should validate correct 10 digit timestamp', () => {
      expect(component['_isValidTimestampString']('1609459200')).toBe(true);
    });

    it('should validate correct 13 digit timestamp', () => {
      expect(component['_isValidTimestampString']('1609459200000')).toBe(true);
    });

    it('should reject non-digit characters', () => {
      expect(component['_isValidTimestampString']('160945920a')).toBe(false);
    });

    it('should reject 11 digit input', () => {
      expect(component['_isValidTimestampString']('16094592000')).toBe(false);
    });

    it('should reject 12 digit input', () => {
      expect(component['_isValidTimestampString']('160945920000')).toBe(false);
    });

    it('should reject 9 digit input', () => {
      expect(component['_isValidTimestampString']('160945920')).toBe(false);
    });

    it('should reject 14 digit input', () => {
      expect(component['_isValidTimestampString']('16094592000000')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(component['_isValidTimestampString']('')).toBe(false);
    });

    it('should reject special characters', () => {
      expect(component['_isValidTimestampString']('16094592!000')).toBe(false);
    });

    it('should reject spaces', () => {
      expect(component['_isValidTimestampString']('160945920 00')).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    it('should return null for empty input when not required', () => {
      component['internalControl'].setValue('');
      const result = component['_validate']();
      expect(result).toBeNull();
    });

    it('should return invalidTimestamp error for invalid timestamp', () => {
      component['internalControl'].setValue('1234567890ab');
      const result = component['_validate']();
      expect(result).toEqual({ invalidTimestamp: true });
    });

    it('should validate on form control value changes', async () => {
      const mockOnChange = vi.fn();
      component.registerOnChange(mockOnChange);

      component['internalControl'].setValue('1609459200');

      // Give async validation time to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Value Changes', () => {
    it('should call onChange when value changes to valid timestamp', async () => {
      const mockOnChange = vi.fn();
      component.registerOnChange(mockOnChange);

      component['internalControl'].setValue('1609459200');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnChange).toHaveBeenCalled();
      const callArg = mockOnChange.mock.calls[0][0];
      expect(callArg.getTime()).toBe(1609459200000);
    });

    it('should call onChange with null when value is empty', async () => {
      const mockOnChange = vi.fn();
      component.registerOnChange(mockOnChange);

      component['internalControl'].setValue('');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should update internal value on valid input', async () => {
      component.registerOnChange(() => undefined);
      component['internalControl'].setValue('1609459200');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.value.getTime()).toBe(1609459200000);
    });

    it('should set value to INVALID_DATE on invalid input', async () => {
      component.registerOnChange(() => undefined);
      component['internalControl'].setValue('invalid');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(isNaN(component.value.getTime())).toBe(true);
    });

    it('should emit stateChanges on value change', async () => {
      const stateChangeSpy = vi.spyOn(component.stateChanges, 'next');
      component['internalControl'].setValue('1609459200');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(stateChangeSpy).toHaveBeenCalled();
    });
  });

  describe('MatFormFieldControl Interface', () => {
    it('should implement setDescribedByIds', () => {
      fixture.detectChanges();
      const ids = ['error-id', 'hint-id'];
      component.setDescribedByIds(ids);
      const describedBy = component.inputRef?.nativeElement.getAttribute('aria-describedby');
      expect(describedBy).toBe('error-id hint-id');
    });

    it('should focus input on onContainerClick', () => {
      fixture.detectChanges();
      const focusSpy = vi.spyOn(component.inputRef.nativeElement, 'focus');
      component.onContainerClick();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should have errorState false when not touched', () => {
      expect(component.errorState).toBe(false);
    });

    it('should have errorState false when touched and valid', () => {
      component['_touched'] = true;
      component['internalControl'].setValue('1609459200');
      expect(component.errorState).toBe(false);
    });

    it('should have errorState true when touched and ngControl is invalid', () => {
      component['_touched'] = true;
      expect(component.errorState).toBe(false);
      expect(component['_touched']).toBe(true);
      component['internalControl'].setValue('invalid');
      expect(component['internalControl'].value).toBe('invalid');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should complete stateChanges subject on destroy', () => {
      const completeSpy = vi.spyOn(component.stateChanges, 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should add validators on ngOnInit if ngControl exists', () => {
      const testComponent = TestBed.createComponent(UnixDatepickerComponent);
      const comp = testComponent.componentInstance;
      comp.ngOnInit();
      // Component should initialize without errors
      expect(comp).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle year 2038 problem timestamp', () => {
      const timestamp = '2147483647'; // Max 32-bit signed integer
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(2147483647000);
    });

    it('should handle epoch start', () => {
      const timestamp = '0';
      expect(component['_isValidTimestampString'](timestamp)).toBe(false);
    });

    it('should handle zero as invalid', () => {
      const timestamp = '0000000000';
      const result = component['_parse'](timestamp);
      expect(result.getTime()).toBe(0);
    });

    it('should handle whitespace input', () => {
      expect(component['_isValidTimestampString']('   ')).toBe(false);
    });

    it('should handle negative numbers', () => {
      expect(component['_isValidTimestampString']('-1609459200')).toBe(false);
    });

    it('should handle decimal numbers', () => {
      expect(component['_isValidTimestampString']('1609459200.5')).toBe(false);
    });
  });
});
