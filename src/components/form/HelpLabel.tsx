import { FormLabel, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { MdHelpOutline } from 'react-icons/md';

export default function HelpLabel({ children, help }: { children: string; help: string; required?: boolean }) {
  return <HStack spacing={1} align="center" mb="7px"><FormLabel mb="0">{children}</FormLabel><Tooltip label={help} hasArrow placement="top"><IconButton aria-label={`Ayuda sobre ${children}`} icon={<MdHelpOutline />} variant="ghost" size="xs" minW="26px" h="26px" borderRadius="full" /></Tooltip></HStack>;
}
