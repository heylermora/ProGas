import { addData, fetchAllData } from 'apiConfig';
import SponsorService from './SponsorService';

jest.mock('apiConfig', () => ({ addData: jest.fn(), fetchAllData: jest.fn(), fetchDataById: jest.fn(), updateData: jest.fn(), deleteData: jest.fn() }));

it('appends new sponsors after the last position in their category', async () => {
  (fetchAllData as jest.Mock).mockResolvedValue([
    { id: 'a', name: 'A', category: 'Tiendas', order: 2 },
    { id: 'b', name: 'B', category: 'Tiendas', order: 8 },
    { id: 'c', name: 'C', category: 'Otros', order: 90 },
  ]);
  await SponsorService.create({ name: 'Nuevo', category: 'Tiendas', order: 1, active: true, logoUrl: '', links: [] });
  expect(addData).toHaveBeenCalledWith('Sponsors', expect.objectContaining({ order: 9 }));
  expect(await SponsorService.nextOrder('Restaurantes/Sodas')).toBe(1);
});
