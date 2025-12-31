import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

export interface ItemsFieldControlProps<TItem = any, TForm = any> {
  items?: TItem[];
  form?: TForm;
  renderItem: (item: TItem, index: number) => React.ReactNode;
  renderFormFields: (
    form: TForm,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => void
  ) => React.ReactNode;
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onAddItem: () => void;
  onRemoveItem?: (item: TItem, index: number) => void;
  addButtonLabel?: string;
  emptyText?: string;
}

const ItemsFieldControl = <TItem, TForm>({
  items = [],
  form,
  renderItem,
  renderFormFields,
  onFormChange,
  onAddItem,
  onRemoveItem,
  addButtonLabel = "Agregar",
  emptyText = "No hay ítems agregados.",
}: ItemsFieldControlProps<TItem, TForm>) => {
  const bg = useColorModeValue("white", "navy.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  const text = useColorModeValue("navy.700", "white");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box borderWidth="1px" borderRadius="2xl" borderColor={border} bg={bg} p={4}>
      <Flex justify="flex-end" mb={2}>
        <Text fontSize="sm" color={muted}>
          {items.length} ítem{items.length !== 1 ? "s" : ""}
        </Text>
      </Flex>

      <Divider mb={3} />

      <Stack spacing={2} mb={4} maxH="200px" overflowY="auto">

        {items.length === 0 && (
          <Text fontSize="sm" color={muted} fontStyle="italic">
            {emptyText}
          </Text>
        )}
        
        {items.map((item, i) => (
          <Flex key={i} justify="space-between" align="center" p={2}>
            <Box flex="1">{renderItem(item, i)}</Box>
            {onRemoveItem && (
              <Button
                size="xs"
                variant="outline"
                colorScheme="red"
                onClick={() => onRemoveItem(item, i)}
              >
                Eliminar
              </Button>
            )}
          </Flex>
        ))}
      </Stack>

      <Divider mb={3} />

      <Stack spacing={3}>
        <Flex gap={3} wrap="wrap" justify="flex-end">
          {form !== undefined && renderFormFields(form as TForm, onFormChange)}
          <Button variant="action" onClick={onAddItem}>
            {addButtonLabel}
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default ItemsFieldControl;