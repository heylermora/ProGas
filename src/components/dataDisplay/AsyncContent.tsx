import { Center, Spinner, Text } from '@chakra-ui/react';
import React from 'react';

type AsyncContentProps = React.PropsWithChildren<{
  isLoading: boolean;
  error?: string;
  loadingLabel?: string;
}>;

export default function AsyncContent({ isLoading, error, loadingLabel = 'Cargando…', children }: AsyncContentProps) {
  if (isLoading) {
    return (
      <Center minH="180px" role="status" aria-live="polite" flexDirection="column" gap="12px">
        <Spinner color="brand.500" size="lg" />
        <Text>{loadingLabel}</Text>
      </Center>
    );
  }
  if (error) {
    return <Center minH="180px" role="alert"><Text color="red.600">{error}</Text></Center>;
  }
  return <>{children}</>;
}
