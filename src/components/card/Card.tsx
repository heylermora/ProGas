// import { Box, useStyleConfig} from '@chakra-ui/react';

import { useStyleConfig, chakra, forwardRef } from '@chakra-ui/react';
import { CustomCardProps } from 'theme/theme';
const CustomCard = forwardRef<CustomCardProps, 'div'>((props, ref) => {
	const { size, variant, direction, align, ...rest } = props;
	const styles = useStyleConfig('Card', { size, variant });

	return (
		<chakra.div
			ref={ref}
			__css={styles}
			display={direction || align ? 'flex' : undefined}
			flexDirection={direction}
			alignItems={align}
			{...rest}
		/>
	);
});

export default CustomCard;
