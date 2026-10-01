import { getCustomerDraft } from './customerDraft';

describe('customerDraft', () => {
  afterEach(() => window.sessionStorage.clear());

  it.each(['null', '[]', '"texto"', 'false'])('ignores an invalid persisted draft: %s', value => {
    window.sessionStorage.setItem('gasMemoCustomerDraft', value);
    expect(getCustomerDraft()).toEqual({});
  });

  it('keeps a valid object draft', () => {
    window.sessionStorage.setItem('gasMemoCustomerDraft', JSON.stringify({ name: 'Ana' }));
    expect(getCustomerDraft()).toEqual({ name: 'Ana' });
  });
});
