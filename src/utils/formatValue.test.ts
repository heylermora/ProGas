import { formatValue } from './formatValue';

describe('formatValue', () => {
  it('adds thousand separators to numeric strings', () => {
    expect(formatValue('1234567')).toBe('1,234,567');
  });

  it('keeps negative and decimal values formatted', () => {
    expect(formatValue('-1234.56')).toBe('-1,234.56');
  });

  it('returns 0 when the value is not numeric', () => {
    expect(formatValue('abc')).toBe('0');
  });

  it('limits unexpectedly long user input', () => {
    const longValue = '1234567890123456789012345';

    expect(formatValue(longValue)).toBe(longValue.slice(0, 19));
  });
});
