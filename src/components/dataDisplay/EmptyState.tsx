import { Button, Center, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import type { ReactElement } from 'react';
import Card from 'components/card/Card';

type EmptyStateProps = {
  icon: IconType;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactElement;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, description, actionLabel, actionIcon, onAction }: EmptyStateProps) {
  const muted = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  return (
    <Card py={14} px={5} align="center" textAlign="center">
      <Center bg="secondaryGray.100" boxSize="56px" borderRadius="full" mb={3}>
        <Icon as={icon} boxSize={7} color="secondaryGray.500" />
      </Center>
      <Text fontWeight="700">{title}</Text>
      <Text color={muted} fontSize="sm" mt={1}>{description}</Text>
      {actionLabel && onAction && <Button mt={5} leftIcon={actionIcon} colorScheme="brand" onClick={onAction}>{actionLabel}</Button>}
    </Card>
  );
}
