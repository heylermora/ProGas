import { mode } from '@chakra-ui/theme-tools';

export const formStyles = {
  components: {
    Form: {
      baseStyle: (props: any) => ({
        label: {
          fontSize: 'sm',
          fontWeight: '700',
          marginBottom: '7px',
        },
        helperText: {
          color: mode('secondaryGray.600', 'secondaryGray.400')(props),
          fontSize: 'xs',
          marginTop: '6px',
        },
      }),
    },
    Accordion: {
      baseStyle: (props: any) => ({
        container: {
          borderColor: mode('secondaryGray.200', 'whiteAlpha.200')(props),
        },
        button: {
          borderRadius: '12px',
          fontWeight: '700',
          minHeight: '44px',
          _hover: { bg: mode('secondaryGray.100', 'whiteAlpha.100')(props) },
          _focusVisible: { boxShadow: '0 0 0 3px rgba(66, 42, 251, 0.28)' },
        },
        panel: {
          color: mode('secondaryGray.700', 'secondaryGray.300')(props),
          lineHeight: '1.65',
        },
      }),
    },
  },
};
