import { convertValue } from './convertValue';
import ExchangeRateService from 'services/ExchangeRateService';

jest.mock('services/ExchangeRateService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedGet = ExchangeRateService.get as jest.Mock;

describe('convertValue', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue([{ value: '500' }]);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('converts USD values to COL using the exchange rate', async () => {
    await expect(convertValue('Total USD', '2', '2026-06-30')).resolves.toEqual({
      newName: 'Total COL',
      newValue: '1,000',
    });
    expect(mockedGet).toHaveBeenCalledWith('2026/06/30', '2026/06/30');
  });

  it('converts COL values to USD using the exchange rate', async () => {
    await expect(convertValue('Total COL', '1,000', '2026-06-30')).resolves.toEqual({
      newName: 'Total USD',
      newValue: '2',
    });
  });

  it('returns the original value when the exchange service fails', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network error'));

    await expect(convertValue('Total USD', '2', '2026-06-30')).resolves.toEqual({
      newName: 'Total USD',
      newValue: '2',
    });
  });
});
