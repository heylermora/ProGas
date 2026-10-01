import { Box, Icon, Stat, StatHelpText, StatLabel, StatNumber, useColorModeValue } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import Card from 'components/card/Card';

type StatCardProps = { label: string; value: string | number; help?: string; icon?: IconType; colorScheme?: string };

export default function StatCard({ label, value, help, icon, colorScheme = 'brand' }: StatCardProps) {
  const text = useColorModeValue('navy.700', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');
  return <Card p="20px"><Stat>{icon && <Box mb={2}><Icon as={icon} color={`${colorScheme}.400`} boxSize={5} /></Box>}<StatLabel color={muted}>{label}</StatLabel><StatNumber color={text}>{value}</StatNumber>{help && <StatHelpText color={muted} mb={0}>{help}</StatHelpText>}</Stat></Card>;
}

