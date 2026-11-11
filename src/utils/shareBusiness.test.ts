import { businessShareUrl } from './shareBusiness';
it('builds a business deep link without carrying customer queries or previous routes', () => {
  const result = new URL(businessShareUrl('negocio /&?', 'https://example.com/app/?customer=private#/customer/info?phone=private'));
  expect(result.origin + result.pathname).toBe('https://example.com/app/');
  expect(result.search).toBe('');
  expect(result.hash.startsWith('#/mall?business=')).toBe(true);
  expect(new URLSearchParams(result.hash.split('?').slice(1).join('?')).get('business')).toBe('negocio /&?');
  expect(result.toString()).not.toContain('private');
});
