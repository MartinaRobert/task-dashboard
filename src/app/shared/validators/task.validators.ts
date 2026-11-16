import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { toDateString } from '../../core/utils/date.utils';

/** Fails when the text is only spaces (Validators.required accepts "   "). */
export const notBlankValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0
    ? { blank: true }
    : null;
};

/** Fails when the selected date is before today. */
export const notInPastValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value as Date | null;
  if (!value) return null;
  return toDateString(value) < toDateString(new Date()) ? { pastDate: true } : null;
};

/** Fails when the same tag is added twice (case does not matter). */
export const uniqueTagsValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const tags = (control as FormArray).value as string[];
  const lower = tags.map((tag) => tag.trim().toLowerCase());
  return new Set(lower).size !== lower.length ? { duplicateTags: true } : null;
};

export interface ErrorMessage {
  key: string;
  params?: Record<string, unknown>;
}

/** Picks the first validation error and returns its translation key. */
export function getErrorMessage(errors: ValidationErrors | null): ErrorMessage | null {
  if (!errors) return null;
  if (errors['required']) return { key: 'validation.required' };
  if (errors['blank']) return { key: 'validation.blank' };
  if (errors['minlength']) {
    return { key: 'validation.minLength', params: { count: errors['minlength'].requiredLength } };
  }
  if (errors['maxlength']) {
    return { key: 'validation.maxLength', params: { count: errors['maxlength'].requiredLength } };
  }
  if (errors['pastDate']) return { key: 'validation.pastDate' };
  if (errors['matDatepickerParse']) return { key: 'validation.invalidDate' };
  if (errors['duplicateTags']) return { key: 'validation.duplicateTags' };
  return { key: 'validation.invalid' };
}
