import { Box, Flex, FlexProps } from '@chakra-ui/react';

export function UlaCurve() {
  return <Box aria-hidden="true" pointerEvents="none" position="absolute" top={0}
    right={{ base: '2px', md: '12px' }} w={{ base: '60px', md: '86px' }} h={{ base: '40px', md: '58px' }}
    border={{ base: '10px solid', md: '14px solid' }} borderTopWidth={0} borderColor="brand.400"
    borderBottomRadius="full" opacity={0.34} />;
}

export function AcostaHorizons() {
  return (
    <Box as="svg" aria-hidden="true" focusable="false" viewBox="0 0 1200 55" preserveAspectRatio="none"
      position="absolute" bottom="-1px" left={0} color="brand.100" w="100%" h={{ base: '36px', md: '54px' }} pointerEvents="none">
      <Box as="path" fill="currentColor" opacity={0.65} d="M0 37C160 5 247 43 410 24S621 6 760 19 1049 36 1200 5V55H0Z" />
      <Box as="path" fill="currentColor" d="M0 46C145 23 301 52 468 42S664 26 812 34 1069 47 1200 22V55H0Z" />
    </Box>
  );
}

export function UlaHandGesture() {
  return (
    <Flex as="span" aria-hidden="true" align="center" gap="3px" h="24px" flexShrink={0}>
      <Box as="span" bg="brand.400" w="5px" h="15px" borderRadius="full" />
      <Box as="span" bg="brand.400" w="5px" h="22px" borderRadius="full" transform="translateY(-3px)" />
      <Box as="span" bg="brand.400" w="5px" h="15px" borderRadius="full" />
    </Flex>
  );
}

export function UlaContainer({ children, ...props }: FlexProps) {
  return <Flex as="span" align="center" justify="center" boxSize="40px" flexShrink={0}
    borderBottomRadius="full" bg="brand.500" color="white" {...props}>{children}</Flex>;
}
