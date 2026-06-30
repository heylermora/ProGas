import { handleNationalIdLookup } from './nationalId';
import { fetchClientNameByCedula } from 'services/CedulaService';

jest.mock('services/CedulaService', () => ({
  fetchClientNameByCedula: jest.fn(),
}));

const mockedFetchClientNameByCedula = fetchClientNameByCedula as jest.Mock;

describe('handleNationalIdLookup', () => {
  beforeEach(() => {
    mockedFetchClientNameByCedula.mockResolvedValue('Memo Gas');
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns an empty name for empty input without calling the service', async () => {
    await expect(handleNationalIdLookup('')).resolves.toEqual({ fullName: '' });
    expect(mockedFetchClientNameByCedula).not.toHaveBeenCalled();
  });

  it('returns an empty name for non numeric input without calling the service', async () => {
    await expect(handleNationalIdLookup('abc123')).resolves.toEqual({ fullName: '' });
    expect(mockedFetchClientNameByCedula).not.toHaveBeenCalled();
  });

  it('returns the fetched full name for numeric national ids', async () => {
    await expect(handleNationalIdLookup('123456789')).resolves.toEqual({ fullName: 'Memo Gas' });
    expect(mockedFetchClientNameByCedula).toHaveBeenCalledWith('123456789');
  });

  it('returns an empty name when the service fails', async () => {
    mockedFetchClientNameByCedula.mockRejectedValueOnce(new Error('service unavailable'));

    await expect(handleNationalIdLookup('123456789')).resolves.toEqual({ fullName: '' });
  });
});
