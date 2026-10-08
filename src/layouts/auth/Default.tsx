import { Box, Flex, Grid } from '@chakra-ui/react';
import { ReactNode } from 'react';

function AuthIllustration({ children, illustrationBackground }: { children: ReactNode; illustrationBackground: string; image?: string }) {
  return <Grid minH="100vh" templateColumns={{ base: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }}
    sx={{ '@supports (min-height: 100dvh)': { minHeight: '100dvh' } }}>
    <Flex minW={0} align="center" justify="center" px={{ base: 0, md: 8, lg: 12 }}>
      {children}
    </Flex>
    <Box aria-hidden="true" display={{ base: 'none', lg: 'block' }} minW={0}
      bgImage={`url(${illustrationBackground})`} bgSize="cover" bgPosition="center"
      borderBottomLeftRadius={{ lg: '120px', xl: '200px' }} />
  </Grid>;
}

export default AuthIllustration;
