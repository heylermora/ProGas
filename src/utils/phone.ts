export const onlyDigits = (value: string) => String(value || '').replace(/\D/g, '');

export const formatPhoneDisplay = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};
