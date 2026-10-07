import { Box, Button, Flex, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';

type Props<T> = { items: T[]; renderItem: (item: T, index: number) => ReactNode; pageSize?: number; emptyLabel?: string; isDisabled?: boolean };

/** Pagination bounds repeated content without introducing a nested scroll area. */
export default function ModalList<T>({ items, renderItem, pageSize, emptyLabel = 'No hay elementos.', isDisabled }: Props<T>) {
  const responsiveSize = useBreakpointValue({ base: 4, md: 5 });
  const count = pageSize ?? responsiveSize ?? 4;
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / count));
  const current = Math.min(page, pages - 1);
  const offset = current * count;
  return <Stack spacing={2}>
    {!items.length ? <Text fontSize="sm" color="gray.500">{emptyLabel}</Text> :
      items.slice(offset, offset + count).map((item, index) => <Box key={offset + index}>{renderItem(item, offset + index)}</Box>)}
    {pages > 1 && <Flex align="center" justify="space-between" gap={2}>
      <Button type="button" size="sm" variant="ghost" isDisabled={isDisabled || current === 0} onClick={() => setPage(current - 1)}>Anterior</Button>
      <Text fontSize="xs" aria-live="polite">{current + 1} de {pages}</Text>
      <Button type="button" size="sm" variant="ghost" isDisabled={isDisabled || current === pages - 1} onClick={() => setPage(current + 1)}>Siguiente</Button>
    </Flex>}
  </Stack>;
}
