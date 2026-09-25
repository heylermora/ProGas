import React from 'react';
import { Badge, Box, Button, Flex, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { useHistory } from 'react-router-dom';

type OrderNavigationProps = {
  currentStep: 1 | 2 | 3;
  backLabel?: string;
  continueLabel?: string;
  isFinal?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  isContinueLoading?: boolean;
};

const steps = [
  { step: 1, label: 'Verificación', shortLabel: 'Datos', route: '/customer/data' },
  { step: 2, label: 'Cliente', shortLabel: 'Cliente', route: '/customer/info' },
  { step: 3, label: 'Pedido', shortLabel: 'Pedido', route: '/customer/products' },
];

export default function OrderNavigation({ currentStep, backLabel = 'Retroceder', continueLabel = 'Continuar', isFinal = false, onBack, onContinue, isContinueLoading = false }: OrderNavigationProps) {
  const history = useHistory();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const panelBg = useColorModeValue('white', 'navy.800');

  return (
    <Box border="1px solid" borderColor={borderColor} borderRadius={{ base: '18px', md: '22px' }} bg={panelBg} p={{ base: '12px', md: '16px' }} boxShadow="sm">
      <Stack spacing="14px">
        <SimpleGrid columns={3} spacing={{ base: '6px', md: '8px' }} w="100%">
          {steps.map((item) => {
            const isDone = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            return (
              <Badge
                key={item.step}
                as={isDone ? 'button' : 'span'}
                aria-label={isDone ? `Volver al paso ${item.step}: ${item.label}` : undefined}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={isDone ? () => history.replace(item.route) : undefined}
                minW="0"
                w="100%"
                minH={{ base: '34px', md: '36px' }}
                textAlign="center"
                px={{ base: '4px', md: '10px' }}
                py={{ base: '5px', md: '6px' }}
                borderRadius="full"
                fontSize={{ base: '9px', md: 'xs' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                whiteSpace="normal"
                lineHeight="1.1"
                colorScheme={isCurrent ? 'brand' : isDone ? 'green' : 'gray'}
                cursor={isDone ? 'pointer' : 'default'}
                transition="transform .18s ease"
                _hover={isDone ? { transform: 'translateY(-1px)' } : undefined}
                _focusVisible={isDone ? { outline: '3px solid', outlineColor: 'green.200', outlineOffset: '2px' } : undefined}
              >
                <Box as="span" display={{ base: 'none', md: 'inline' }}>{isDone ? '✓' : item.step}. {item.label}</Box>
                <Box as="span" display={{ base: 'inline', md: 'none' }}>{isDone ? '✓' : item.step}. {item.shortLabel}</Box>
              </Badge>
            );
          })}
        </SimpleGrid>

        <Flex direction={{ base: 'column-reverse', md: 'row' }} justify="space-between" gap="10px" align={{ base: 'stretch', md: 'center' }}>
          <Button variant="outline" leftIcon={<MdArrowBack />} onClick={onBack} isDisabled={!onBack} flex={{ base: '0 0 auto', md: 1 }} w={{ base: '100%', md: 'auto' }} minW="0" h="auto" minH="48px" py="10px" px="14px" whiteSpace="normal" lineHeight="1.25">
            {backLabel}
          </Button>
          <Text display={{ base: 'none', md: 'block' }} color={muted} fontSize="sm" textAlign="center" flexShrink={0}>
            Paso {currentStep} de {steps.length}
          </Text>
          <Button colorScheme="brand" rightIcon={isFinal ? <MdCheckCircle /> : <MdArrowForward />} onClick={onContinue} isLoading={isContinueLoading} loadingText={continueLabel} flex={{ base: '0 0 auto', md: 1 }} w={{ base: '100%', md: 'auto' }} minW="0" h="auto" minH="48px" py="10px" px="14px" whiteSpace="normal" lineHeight="1.25">
            {continueLabel}
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
