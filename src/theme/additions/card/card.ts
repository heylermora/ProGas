import { mode } from '@chakra-ui/theme-tools';
const Card = {
	baseStyle: (props: any) => ({
		p: { base: '18px', md: '22px' },
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		position: 'relative',
		borderRadius: '22px',
		minWidth: '0px',
		wordWrap: 'break-word',
		bg: mode('#ffffff', 'navy.800')(props),
		backgroundClip: 'border-box',
		border: '1px solid',
		borderColor: mode('rgba(226, 232, 240, 0.9)', 'whiteAlpha.100')(props),
		boxShadow: mode('0 18px 45px rgba(112, 144, 176, 0.12)', '0 18px 45px rgba(0, 0, 0, 0.22)')(props)
	})
};

export const CardComponent = {
	components: {
		Card
	}
};
