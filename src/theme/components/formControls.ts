import { mode } from '@chakra-ui/theme-tools';

const field = (props: any) => ({
  bg: 'transparent', color: mode('navy.700', 'white')(props), border: '1px solid',
  borderColor: mode('gray.200', 'whiteAlpha.300')(props), borderRadius: '14px', fontSize: 'sm', fontWeight: '500',
  _placeholder: { color: mode('gray.500', 'gray.400')(props) },
  _hover: { borderColor: mode('gray.400', 'whiteAlpha.500')(props) },
  _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
  _invalid: { borderColor: 'red.500', boxShadow: '0 0 0 1px var(--chakra-colors-red-500)' },
});

export const unifiedFormControls = { components: {
  Input: { defaultProps: { variant: 'auth', size: 'md' }, variants: { auth: (props: any) => ({ field: field(props) }) }, sizes: { md: { field: { h: '46px', minH: '46px', px: 3 } } } },
  Select: { defaultProps: { variant: 'auth', size: 'md' }, variants: { auth: (props: any) => ({ field: field(props) }) }, sizes: { md: { field: { h: '46px', minH: '46px', px: 3 } } } },
  Textarea: { defaultProps: { variant: 'auth', size: 'md' }, variants: { auth: (props: any) => ({ ...field(props), minH: '100px', px: 3, py: 3 }) } },
  Form: { baseStyle: (props: any) => ({ helperText: { color: mode('gray.600', 'gray.300')(props), fontSize: 'sm', mt: 2 } }) },
  FormLabel: { baseStyle: { fontSize: 'sm', fontWeight: '700', mb: 2 } },
  FormError: { baseStyle: { text: { fontSize: 'xs', mt: 2 } } },
} };
