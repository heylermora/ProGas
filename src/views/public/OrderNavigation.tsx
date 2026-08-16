import React from 'react';
import { Badge, Box, Button, Flex, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { useHistory } from 'react-router-dom';

type OrderNavigationProps = {
  currentStep: 1 | 2 | 3;
  backLabel?: string;
  continueLabel?: string;
  isFinal?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
};

const steps = [
  { step: 1, label: 'Verificación', shortLabel: 'Verif.', route: '/customer/data' },
  { step: 2, label: 'Cliente', shortLabel: 'Cliente', route: '/customer/info' },
  { step: 3, label: 'Pedido', shortLabel: 'Pedido', route: '/customer/products' },
];

export default function OrderNavigation({ currentStep, backLabel = 'Retroceder', continueLabel = 'Continuar', isFinal = false, onBack, onContinue }: OrderNavigationProps) {
  const history = useHistory();
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const panelBg = useColorModeValue('white', 'navy.800');

  return (
    <Box border="1px solid" borderColor={borderColor} borderRadius={{ base: '18px', md: '22px' }} bg={panelBg} p={{ base: '12px', md: '16px' }} boxShadow="sm">
      <Stack spacing="14px">
        <HStack spacing={{ base: '4px', md: '8px' }} overflowX={{ base: 'visible', md: 'auto' }} pb="2px" w="100%">
          {steps.map((item) => {
            const isDone = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            return (
              <Badge
                key={item.step}
                as={isDone ? 'button' : 'span'}
                aria-label={isDone ? `Volver al paso ${item.step}: ${item.label}` : undefined}
                onClick={isDone ? () => history.replace(item.route) : undefined}
                flex={{ base: 1, md: '0 0 auto' }}
                minW="0"
                textAlign="center"
                px={{ base: '6px', md: '10px' }}
                py="6px"
                borderRadius="full"
                fontSize={{ base: '10px', sm: '11px', md: 'xs' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                whiteSpace="nowrap"
                colorScheme={isCurrent ? 'brand' : isDone ? 'green' : 'gray'}
                cursor={isDone ? 'pointer' : 'default'}
                transition="transform .18s ease"
                _hover={isDone ? { transform: 'translateY(-1px)' } : undefined}
                _focusVisible={isDone ? { outline: '3px solid', outlineColor: 'green.200', outlineOffset: '2px' } : undefined}
              >
                <Box as="span" display={{ base: 'none', sm: 'inline' }}>{isDone ? '✓' : item.step}. {item.label}</Box>
                <Box as="span" display={{ base: 'inline', sm: 'none' }}>{isDone ? '✓' : item.step}. {item.shortLabel}</Box>
              </Badge>
            );
          })}
        </HStack>

        <Flex direction="row" justify="space-between" gap="10px" align="center">
          <Button variant="outline" leftIcon={<MdArrowBack />} onClick={onBack} isDisabled={!onBack} flex={{ base: 1, md: '0 0 auto' }} minW="0" whiteSpace="normal">
            {backLabel}
          </Button>
          <Text display={{ base: 'none', md: 'block' }} color={muted} fontSize="sm" textAlign="center" flexShrink={0}>
            Paso {currentStep} de {steps.length}
          </Text>
          <Button colorScheme="brand" rightIcon={isFinal ? <MdCheckCircle /> : <MdArrowForward />} onClick={onContinue} flex={{ base: 1, md: '0 0 auto' }} minW="0" whiteSpace="normal">
            {continueLabel}
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
