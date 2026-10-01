import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';

type State = { hasError: boolean };
type Props = React.PropsWithChildren<{ onReload?: () => void }>;

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled application render error', error, info);
  }

  private reload = () => (this.props.onReload || (() => window.location.reload()))();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box as="main" minH="100vh" display="flex" alignItems="center" justifyContent="center" p="24px">
        <Box maxW="520px" textAlign="center">
          <Heading size="lg">No pudimos mostrar esta pantalla</Heading>
          <Text color="gray.600" mt="12px" mb="20px">
            Recargá la aplicación para intentarlo nuevamente. Si el problema continúa, contactá al equipo de soporte.
          </Text>
          <Button colorScheme="brand" onClick={this.reload}>Recargar aplicación</Button>
        </Box>
      </Box>
    );
  }
}
