import React, { useState, useMemo, useCallback } from "react";
import { Box, Text, Input, Select, Flex } from "@chakra-ui/react";
import { customAlphabet } from "nanoid";
import { useHistory } from "react-router-dom";

import Form from "components/form/Form";
import OkModal from "components/modal/OkModal";
import orderService from "services/OrderService";
import  { OrderItem, ProductItem } from "interfaces/OrderItem";
import FormField from "interfaces/FormField";
import Error from "components/exceptions/Error";
import { handleNationalIdLookup } from "utils/nationalId";

const nano = customAlphabet("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789", 6);

const gasPrices: Record<string, number> = {
  "Tipo 1": 6500,
  "Tipo 2": 7200,
  "Tipo 3": 8100,
};

export default function NewOrder() {
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productForm, setProductForm] = useState({
    gasType: "Tipo 1",
    quantity: 1,
    price: gasPrices["Tipo 1"],
    comment: "",
  });
  const history = useHistory();

  const handleNationalIdChange = useCallback(async (newValue: string) => {
    setClientId(newValue);

    const { fullName } = await handleNationalIdLookup(newValue);

    setClientName(fullName);
  }, []);

  const handleProductFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setProductForm((prev) => {
      // Cuando cambia el tipo de gas, actualizamos tipo y precio
      if (name === "gasType") {
        return {
          ...prev,
          gasType: value,
          price: gasPrices[value] ?? prev.price,
        };
      }

      return {
        ...prev,
        [name]: name === "quantity" || name === "price" ? Number(value) : value,
      };
    });
  };

const handleAddProduct = () => {
  setProducts((prev) => {
    // Buscar si ya existe un producto del mismo tipo
    const existingIndex = prev.findIndex(
      (p) => p.gasType === productForm.gasType
    );

    // Si existe, sumamos la cantidad al existente
    if (existingIndex !== -1) {
      return prev.map((p, idx) =>
        idx === existingIndex
          ? {
              ...p,
              quantity: p.quantity + productForm.quantity,
              // opcional: si querés actualizar el comentario con el último ingresado:
              comment: productForm.comment || p.comment,
            }
          : p
      );
    }

    // Si no existe, lo agregamos como nuevo
    return [
      ...prev,
      {
        gasType: productForm.gasType,
        quantity: productForm.quantity,
        price: productForm.price,
        comment: productForm.comment,
      },
    ];
  });

  // Reset del formulario
  setProductForm({
    gasType: "Tipo 1",
    quantity: 1,
    price: gasPrices["Tipo 1"],
    comment: "",
  });
};

  const handleRemoveProduct = (item: ProductItem) => {
    setProducts((prev) => prev.filter((p) => p.gasType !== item.gasType));
  };

  const renderProductItem = (item: ProductItem) => (
    <Box>
      <Text fontWeight="500">Pedido de {item.gasType}</Text>
      <Text fontSize="sm">
        Cantidad: {item.quantity} • Precio: ₡{item.price}
      </Text>
      {item.comment && (
        <Text fontSize="xs" color="gray.500">
          Comentario: {item.comment}
        </Text>
      )}
    </Box>
  );

  const renderProductFormFields = (
    form: typeof productForm,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => void
  ) => (
    <Flex gap={3} wrap="wrap">
      <Box>
        <Text fontSize="xs" mb={1}>
          Tipo de gas
        </Text>
        <Select
          isRequired
          variant="auth"
          fontSize="sm"
          name="gasType"
          value={form.gasType}
          onChange={onChange}
          size="md"
          maxW="170px"
        >
          <option value="Tipo 1">Tipo 1 – Uso doméstico</option>
          <option value="Tipo 2">Tipo 2 – Comercial/industrial</option>
          <option value="Tipo 3">Tipo 3 – Especial</option>
        </Select>
      </Box>

      <Box>
        <Text fontSize="xs" mb={1}>
          Cantidad
        </Text>
        <Input
          isRequired
          variant="auth"
          fontSize="sm"
          type="number"
          size="md"
          name="quantity"
          min={1}
          maxW="60px"
          value={form.quantity}
          onChange={onChange}
        />
      </Box>

      <Box>
        <Text fontSize="xs" mb={1}>
          Precio
        </Text>
        <Input
          isRequired
          variant="auth"
          fontSize="sm"
          type="number"
          size="md"
          name="price"
          min={1}
          maxW="160px"
          value={form.price}
          isDisabled
        />
      </Box>

      <Box>
        <Text fontSize="xs" mb={1}>
          Comentario
        </Text>
        <Input
          variant="auth"
          fontSize="sm"
          type="text"
          size="md"
          name="comment"
          value={form.comment}
          onChange={onChange}
          placeholder="Comentario (opcional)"
        />
      </Box>
    </Flex>
  );

  const fields: FormField[] = useMemo(
    () => [
      {
        label: "Cédula del cliente",
        name: "clientId",
        type: "text",
        value: clientId,
        helper: clientName
          ? "¡Cliente encontrado!"
          : "Sin espacios ni guiones. Solo dígitos.",
        validation: {
          required: true,
          regex: /^\d+$/,
        },
        onChange: handleNationalIdChange,
      },
      {
        label: "Nombre del cliente",
        name: "clientName",
        type: "text",
        value: clientName ? clientName : "",
        validation: { required: true },
        isDisabled: true,
      },
      {
        label: "Fecha y hora de solicitud",
        name: "requestDateTime",
        type: "datetime-local",
        value: new Date().toISOString().slice(0, 16),
        validation: { required: true },
        isDisabled: true,
      },
      {
        label: "Comentario adicional",
        name: "comment",
        type: "text",
        value: "",
        validation: { required: false },
      },
      {
        label: "Ubicación",
        name: "location",
        type: "location",
        helper: "Mueva el marcador solo si necesita ajustar la ubicación",
        value: {
          coords: [0, 0],
          address: "",
          isManualAddress: false,
        },
      },
      {
        label: "Productos del pedido",
        name: "products",
        type: "items",
        value: {
          title: "Productos del pedido",
          items: products,
          form: productForm,
          renderItem: renderProductItem,
          renderFormFields: renderProductFormFields,
          onFormChange: handleProductFormChange,
          onAddItem: handleAddProduct,
          onRemoveItem: handleRemoveProduct,
        },
      },
    ],
    [
      clientId,
      clientName,
      products,
      productForm,
      renderProductFormFields,
      handleNationalIdChange,
      handleProductFormChange,
      handleAddProduct,
      handleRemoveProduct,
    ]
  );

  const handleFormSubmit = async (fieldValues: { [key: string]: any }) => {
    const newOrder: Omit<OrderItem, "id"> = {
      orderCode: nano(),
      status: "Nuevo",
      requestDate: fieldValues.requestDateTime,
      client: fieldValues.clientName,
      clientId: fieldValues.clientId,
      location: fieldValues.location,
      comment: fieldValues.comment,
      items: products,
      totalAmount: products.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0),
    };

    orderService
      .create(newOrder)
      .then((response: { id: string }) => {
        console.log("Orden creada con ID de Firebase:", response.id);
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error?.response?.status !== 400) {
          setIsError(true);
        }
      });
  };

  const closeModalAndRedirect = () => {
    setShowModal(false);
    history.push("/admin/order/index");
  };

  if (isError) return <Error />;

  return (
    <>
      <Form
        title="Nuevo Pedido de Gas"
        button="Crear Pedido"
        back="/admin/order/index"
        fields={fields}
        onSubmit={handleFormSubmit}
      />
      {showModal && (
        <OkModal
          message="Pedido de Gas creado correctamente."
          isOpen={showModal}
          onClose={closeModalAndRedirect}
        />
      )}
    </>
  );
}