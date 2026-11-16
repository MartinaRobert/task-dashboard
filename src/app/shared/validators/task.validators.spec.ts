import { FormArray, FormControl } from '@angular/forms';
import {
  getErrorMessage,
  notBlankValidator,
  notInPastValidator,
  uniqueTagsValidator,
} from './task.validators';

describe('task validators', () => {
  it('notBlankValidator rejects only-space text', () => {
    expect(notBlankValidator(new FormControl('   '))).toEqual({ blank: true });
    expect(notBlankValidator(new FormControl('Task'))).toBeNull();
    expect(notBlankValidator(new FormControl(''))).toBeNull();
  });

  it('notInPastValidator rejects dates before today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(notInPastValidator(new FormControl(yesterday))).toEqual({ pastDate: true });
    expect(notInPastValidator(new FormControl(new Date()))).toBeNull();
    expect(notInPastValidator(new FormControl(null))).toBeNull();
  });

  it('uniqueTagsValidator rejects duplicates ignoring case', () => {
    const tags = (values: string[]) => new FormArray(values.map((v) => new FormControl(v)));
    expect(uniqueTagsValidator(tags(['UI', 'ui']))).toEqual({ duplicateTags: true });
    expect(uniqueTagsValidator(tags(['UI', 'API']))).toBeNull();
  });

  it('getErrorMessage maps each error to a translation key', () => {
    expect(getErrorMessage(null)).toBeNull();
    expect(getErrorMessage({ required: true })?.key).toBe('validation.required');
    expect(getErrorMessage({ blank: true })?.key).toBe('validation.blank');
    expect(getErrorMessage({ minlength: { requiredLength: 3 } })).toEqual({
      key: 'validation.minLength',
      params: { count: 3 },
    });
    expect(getErrorMessage({ maxlength: { requiredLength: 80 } })?.params).toEqual({ count: 80 });
    expect(getErrorMessage({ pastDate: true })?.key).toBe('validation.pastDate');
    expect(getErrorMessage({ matDatepickerParse: {} })?.key).toBe('validation.invalidDate');
    expect(getErrorMessage({ duplicateTags: true })?.key).toBe('validation.duplicateTags');
    expect(getErrorMessage({ other: true })?.key).toBe('validation.invalid');
  });
});
