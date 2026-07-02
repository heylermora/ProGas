import React from 'react';
import { Badge, Box, Button, Flex, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { MdArrowBack, MdArrowForward, MdCheckCircle } from 'react-icons/md';

type OrderNavigationProps = {
  currentStep: 1 | 2 | 3;
  backLabel?: string;
  continueLabel?: string;
  isFinal?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
};

const steps = [
  { step: 1, label: 'Verificación' },
  { step: 2, label: 'Cliente' },
  { step: 3, label: 'Pedido' },
];

export default function OrderNavigation({ currentStep, backLabel = 'Retroceder', continueLabel = 'Continuar', isFinal = false, onBack, onContinue }: OrderNavigationProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const panelBg = useColorModeValue('white', 'navy.800');

  return (
    <Box border="1px solid" borderColor={borderColor} borderRadius={{ base: '18px', md: '22px' }} bg={panelBg} p={{ base: '12px', md: '16px' }} boxShadow="sm">
      <Stack spacing="14px">
        <HStack spacing="8px" overflowX="auto" pb="2px">
          {steps.map((item) => {
            const isDone = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            return (
              <Badge
                key={item.step}
                flexShrink={0}
                px="10px"
                py="6px"
                borderRadius="full"
                colorScheme={isCurrent ? 'brand' : isDone ? 'green' : 'gray'}
              >
                {isDone ? '✓' : item.step}. {item.label}
              </Badge>
            );
          })}
        </HStack>

        <Flex direction={{ base: 'column-reverse', sm: 'row' }} justify="space-between" gap="10px" align={{ base: 'stretch', sm: 'center' }}>
          <Button variant="outline" leftIcon={<MdArrowBack />} onClick={onBack} isDisabled={!onBack} w={{ base: '100%', sm: 'auto' }}>
            {backLabel}
          </Button>
          <Text color={muted} fontSize="sm" textAlign={{ base: 'center', sm: 'left' }}>
            Paso {currentStep} de {steps.length}
          </Text>
          <Button colorScheme="brand" rightIcon={isFinal ? <MdCheckCircle /> : <MdArrowForward />} onClick={onContinue} w={{ base: '100%', sm: 'auto' }}>
            {continueLabel}
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
