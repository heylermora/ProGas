import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';

type Props = { title: string; summary?: string; children: ReactNode; defaultOpen?: boolean; reveal?: boolean };

/** Progressive disclosure for secondary details; reveal the section when its fields need correction. */
export default function ModalSection({ title, summary, children, defaultOpen = false, reveal }: Props) {
  const [index, setIndex] = useState(defaultOpen ? 0 : -1);
  useEffect(() => { if (reveal) setIndex(0); }, [reveal]);
  const muted = useColorModeValue('gray.600', 'gray.300');
  return <Accordion allowToggle index={index} onChange={value => setIndex(value as number)} borderWidth="1px" borderRadius="14px" overflow="hidden">
    <AccordionItem border={0}>
      <AccordionButton px={4} py={3}>
        <Box flex="1" minW={0} textAlign="left"><Text fontSize="sm" fontWeight="700">{title}</Text>
          {summary && <Text fontSize="xs" fontWeight="400" color={muted} noOfLines={2}>{summary}</Text>}
        </Box><AccordionIcon ml={2} />
      </AccordionButton>
      <AccordionPanel px={4} pb={4}>{children}</AccordionPanel>
    </AccordionItem>
  </Accordion>;
}
