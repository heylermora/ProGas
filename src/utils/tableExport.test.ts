import { csvCell } from './tableExport';

it('keeps exported values in a single CSV cell and neutralizes spreadsheet formulas', () => {
  expect(csvCell('Acosta, "Centro"')).toBe('"Acosta, ""Centro"""');
  expect(csvCell(' =SUM(1,2)')).toBe("\"' =SUM(1,2)\"");
  expect(csvCell('Panadería')).toBe('"Panadería"');
});
