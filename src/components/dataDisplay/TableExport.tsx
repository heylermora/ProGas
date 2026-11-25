import { Alert, Checkbox, CheckboxGroup, IconButton, Menu, MenuButton, MenuItem, MenuList, Select, SimpleGrid, Stack, Text, useDisclosure } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import FormModal from 'components/modal/FormModal';
import { useState } from 'react';
import { MdDownload, MdMenu } from 'react-icons/md';
import { downloadTable, ExportFormat } from 'utils/tableExport';

type Props = {
  filename: string;
  columns: string[];
  scope: string;
  matched: number;
  rows: (splitCategories: boolean) => string[][];
  categoryOptions?: boolean;
  disabled?: boolean;
  allRows?: string[][];
};
const formats: ExportFormat[] = ['CSV', 'PDF', 'Excel'];

export default function TableExport({ filename, columns, scope, matched, rows, categoryOptions, disabled, allRows }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [format, setFormat] = useState<ExportFormat>('CSV');
  const [selected, setSelected] = useState(columns);
  const [split, setSplit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [all, setAll] = useState(false);
  const [error, setError] = useState('');
  const selectedIndices = columns.flatMap((column, index) => selected.includes(column) ? [index] : []);
  const data = isOpen ? all && allRows ? allRows : rows(split) : [];
  const submit = async () => {
    if (busy || !selectedIndices.length || !data.length) return;
    setBusy(true);
    setError('');
    try {
      await downloadTable(filename, format, selectedIndices.map(index => columns[index]), data.map(row => selectedIndices.map(index => row[index])));
      onClose();
    } catch { setError('No se pudo generar el archivo. Intentá nuevamente.'); }
    finally { setBusy(false); }
  };
  return <>
    <Menu placement="bottom-end">
      <MenuButton as={IconButton} aria-label="Menú de acciones" icon={<MdMenu />} variant="outline" isDisabled={disabled} />
      <MenuList><MenuItem icon={<MdDownload />} onClick={() => { setError(''); onOpen(); }}>Exportar</MenuItem></MenuList>
    </Menu>
    <FormModal isOpen={isOpen} onClose={onClose} title={`Exportar ${filename.toLowerCase()}`} onSubmit={submit}
      submitLabel="Descargar" isSubmitting={busy} isDisabled={!selectedIndices.length || data.length === 0}>
      <Stack spacing={4}>
        {allRows && <FormField label="Alcance"><Select value={all ? 'all' : 'filtered'} onChange={event => setAll(event.target.value === 'all')}>
          <option value="filtered">Pestaña seleccionada</option><option value="all">Todas las categorías</option>
        </Select></FormField>}
        <Text>{all && allRows ? 'Todas las categorías' : scope}. <strong>{all && allRows ? allRows.length : matched} coincidencias</strong> y {data.length} filas en el archivo. Se incluyen todas las coincidencias de los filtros.</Text>
        <FormField label="Formato"><Select value={format} onChange={event => setFormat(event.target.value as ExportFormat)}>{formats.map(value => <option key={value}>{value}</option>)}</Select></FormField>
        {categoryOptions && <FormField label="Comercios con varias categorías" help="Se incluyen todas las categorías de cada comercio que coincide con los filtros."><Select value={split ? 'split' : 'single'} onChange={event => setSplit(event.target.value === 'split')}>
          <option value="single">Una fila por comercio</option>
          <option value="split">Una fila por cada categoría del comercio</option>
        </Select></FormField>}
        <FormField label="Columnas">
          <CheckboxGroup value={selected} onChange={values => setSelected(values.map(String))}><SimpleGrid columns={{ base: 1, sm: 2 }} gap={2} role="group" aria-label="Columnas del archivo">
            {columns.map(column => <Checkbox key={column} value={column}>{column}</Checkbox>)}
          </SimpleGrid></CheckboxGroup>
        </FormField>
        {error && <Alert status="error">{error}</Alert>}
      </Stack>
    </FormModal>
  </>;
}
