import { Badge, BadgeProps } from '@chakra-ui/react';

type StatusBadgeProps = BadgeProps & { active: boolean; activeLabel?: string; inactiveLabel?: string };

export default function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo', ...props }: StatusBadgeProps) {
  return <Badge colorScheme={active ? 'green' : 'gray'} borderRadius="full" px={3} py={1} {...props}>{active ? activeLabel : inactiveLabel}</Badge>;
}

