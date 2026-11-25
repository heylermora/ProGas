import { Box, Flex, FlexProps } from '@chakra-ui/react';

export function UlaCurve() {
  return (
    <Box aria-hidden="true" pointerEvents="none" flexShrink={0}
      w={{ base: '64px', md: '132px' }} lineHeight={0} color="brand.400">
      <svg width="100%" viewBox="0 0 125 113" focusable="false">
        <path d="M14 -49V49C14 115 111 115 111 49V-49" fill="none" stroke="currentColor" strokeWidth="28" />
      </svg>
    </Box>
  );
}

export function AcostaHorizons() {
  return (
    <Box aria-hidden="true" position="absolute" bottom="-1px" left={0} right={0} zIndex={1}
      h={{ base: '38px', md: '60px' }} pointerEvents="none">
      <svg width="100%" height="100%" viewBox="0 0 418 126" preserveAspectRatio="none" focusable="false">
        <path fill="#F5F2FF" d="M0 76C71 42 108 72 156 53C236 20 284 48 326 25C371 6 398 27 418 16V126H0Z" />
        <path fill="#E8E3FF" d="M0 107C66 78 120 114 194 81C276 46 326 100 418 54V126H0Z" />
      </svg>
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
