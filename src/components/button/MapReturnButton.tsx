import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { MdChevronLeft, MdMap } from 'react-icons/md';

type Props = { destination: 'generales' | 'específicas'; onClick: () => void; isDisabled?: boolean };

export default function MapReturnButton({ destination, onClick, isDisabled }: Props) {
  return <Button variant="mapReturn" aria-label={`Volver a categorías ${destination}`} onClick={onClick} isDisabled={isDisabled}>
    <Flex as="span" aria-hidden="true" align="center" justify="center" boxSize="36px" flexShrink={0} borderRadius="12px" bg="navy.900" color="yellow.200" boxShadow="inset 0 1px 0 rgba(255,255,255,.25)"><Icon as={MdChevronLeft} boxSize="28px" /></Flex>
    <Box as="span" flex="1" minW={0} textAlign="left">
      <Text as="span" display="block" fontSize="9px" letterSpacing=".1em" fontWeight="900">VOLVER AL MAPA</Text>
      <Text as="span" display="block" fontSize={{ base: '12px', sm: '14px' }} fontWeight="900" lineHeight="1.2">Categorías {destination}</Text>
    </Box>
    <Icon as={MdMap} aria-hidden="true" boxSize="20px" flexShrink={0} />
  </Button>;
}
