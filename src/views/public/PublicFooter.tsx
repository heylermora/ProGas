import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RLink } from 'react-router-dom';
import { MdAdminPanelSettings, MdHandshake, MdLogin, MdSupportAgent } from 'react-icons/md';

const accessCards = [
  {
    title: 'Admin',
    description: 'Gestión completa: pedidos, productos y CRUD de patrocinadores.',
    icon: MdAdminPanelSettings,
    badge: 'Control total',
  },
  {
    title: 'Colaborador',
    description: 'Ingreso operativo para atender pedidos y apoyar la gestión diaria.',
    icon: MdSupportAgent,
    badge: 'Operación',
  },
];

export default function PublicFooter() {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const footerBg = useColorModeValue('white', 'navy.800');
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const logoBg = useColorModeValue('brand.500', 'brand.300');
  const accentGradient = useColorModeValue(
    'linear(to-r, brand.500, orange.400)',
    'linear(to-r, brand.300, orange.300)'
  );

  return (
    <Box as="footer" mt={{ base: '36px', md: '56px' }} pt="22px" borderTop="1px solid" borderColor={borderColor}>
      <Box bg={footerBg} borderRadius={{ base: '22px', md: '30px' }} p={{ base: '16px', md: '22px' }} boxShadow="lg" border="1px solid" borderColor={borderColor}>
        <Flex direction={{ base: 'column', lg: 'row' }} align={{ base: 'stretch', lg: 'center' }} justify="space-between" gap={{ base: '18px', md: '24px' }}>
          <Stack spacing="14px" flex="1">
            <HStack spacing="12px">
              <Box bg={logoBg} color="white" w="46px" h="46px" borderRadius="16px" display="flex" alignItems="center" justifyContent="center" fontWeight="900">
                JM
              </Box>
              <Box>
                <Text color={textColor} fontSize="sm">Desarrollado por</Text>
                <Text fontWeight="800">Johel Mora</Text>
              </Box>
            </HStack>
            <Text color={textColor} fontSize="sm" maxW="560px">
              ¿Desea anunciarse en Gas Memo? Consulte los paquetes disponibles para patrocinadores o ingrese al panel según su perfil.
            </Text>
          </Stack>

          <Stack spacing="12px" minW={{ base: '100%', lg: '460px' }}>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing="10px">
              {accessCards.map((card) => (
                <Box key={card.title} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="18px" p="14px">
                  <HStack align="flex-start" spacing="10px">
                    <Box bgGradient={accentGradient} color="white" borderRadius="14px" p="9px" display="flex">
                      <Icon as={card.icon} w="20px" h="20px" />
                    </Box>
                    <Box minW="0">
                      <HStack spacing="6px" mb="4px" flexWrap="wrap">
                        <Text fontWeight="800">{card.title}</Text>
                        <Badge colorScheme="brand" borderRadius="full">{card.badge}</Badge>
                      </HStack>
                      <Text color={textColor} fontSize="xs" lineHeight="1.45">{card.description}</Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing="10px">
              <Button as={RLink} to="/auth/sign-in" leftIcon={<MdLogin />} colorScheme="brand" size="md" flex="1">
                Iniciar sesión
              </Button>
              <Button as={RLink} to="/sponsors/packages" leftIcon={<MdHandshake />} variant="outline" colorScheme="brand" size="md" flex="1">
                Quiero ser patrocinador
              </Button>
            </Stack>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}
