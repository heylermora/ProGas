import React, { useMemo, useState } from 'react';
import { Box, FormControl, FormLabel, Select as NativeSelect, useColorModeValue } from '@chakra-ui/react';
import Select, { StylesConfig } from 'react-select';

type CategoryOption = { value: string; label: string };
type Props = {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  id?: string;
};

export default function SearchableCategorySelect({ categories, value, onChange, id = 'business-category' }: Props) {
  const [query, setQuery] = useState('');
  const background = useColorModeValue('#FFFFFF', '#111C44');
  const text = useColorModeValue('#1B2559', '#FFFFFF');
  const border = useColorModeValue('#E2E8F0', '#354166');
  const hover = useColorModeValue('#F1EEFF', '#26305A');
  const muted = useColorModeValue('#64748B', '#A0AEC0');
  const options = useMemo(() => [
    { value: '', label: 'Todas las categorías' },
    ...Array.from(new Set(categories)).filter(Boolean).map((category) => ({ value: category, label: category })),
  ], [categories]);
  const styles: StylesConfig<CategoryOption, false> = {
    control: (base, state) => ({ ...base, backgroundColor: background, borderColor: state.isFocused ? '#5930E8' : border,
      minHeight: 48, borderRadius: 14, boxShadow: state.isFocused ? '0 0 0 2px rgba(89,48,232,.2)' : 'none',
      ':hover': { borderColor: '#5930E8' } }),
    menu: (base) => ({ ...base, backgroundColor: background, borderRadius: 14, overflow: 'hidden', zIndex: 20 }),
    menuList: (base) => ({ ...base, maxHeight: 280 }),
    option: (base, state) => ({ ...base, minHeight: 44, display: 'flex', alignItems: 'center',
      backgroundColor: state.isSelected ? '#5930E8' : state.isFocused ? hover : background,
      color: state.isSelected ? '#FFFFFF' : text, cursor: 'pointer', ':active': { backgroundColor: hover, color: text } }),
    input: (base) => ({ ...base, color: text }),
    singleValue: (base) => ({ ...base, color: text }),
    placeholder: (base) => ({ ...base, color: muted }),
    noOptionsMessage: (base) => ({ ...base, color: muted }),
  };

  return (
    <FormControl>
      <FormLabel htmlFor={id} fontSize="sm" fontWeight="700">Categoría</FormLabel>
      <Box display={{ base: 'block', md: 'none' }}>
        <NativeSelect id={id} size="lg" borderRadius="14px" value={value}
          onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </NativeSelect>
      </Box>
      <Box display={{ base: 'none', md: 'block' }}>
      <Select<CategoryOption, false>
        inputId={`${id}-search`}
        instanceId={id}
        options={options}
        value={options.find((option) => option.value === value) || options[0]}
        aria-label="Categoría"
        inputValue={query}
        onInputChange={(next, action) => {
          if (action.action === 'input-change') setQuery(next);
        }}
        onChange={(option) => { onChange(option?.value || ''); setQuery(''); }}
        isSearchable
        isClearable={Boolean(value)}
        placeholder="Buscar categoría"
        noOptionsMessage={() => 'No encontramos esa categoría.'}
        styles={styles}
      />
      </Box>
    </FormControl>
  );
}

