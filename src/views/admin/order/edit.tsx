import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Center,
  Spinner,
  useColorModeValue,
  Box,
  Text,
  Input,
  Select,
  Flex,
} from "@chakra-ui/react";

import Form from "components/form/Form";
import OkModal from "components/modal/OkModal";
import OrderService from "services/OrderService";
import { OrderItem, ProductItem } from "interfaces/OrderItem";
import FormField from "interfaces/FormField";
import Error from "components/exceptions/Error";
import { useOrderRefresh } from "contexts/OrderRefreshContext";
import { handleNationalIdLookup } from "utils/nationalId";

const gasPrices: Record<string, number> = {
  "Tipo 1": 6500,
  "Tipo 2": 7200,
  "Tipo 3": 8100,
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

export default function Edit() {
  const spinnerColor = useColorModeValue("brand.700", "white");
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { triggerRefresh } = useOrderRefresh();

  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [existingOrderData, setExistingOrderData] = useState<OrderItem | null>(
    null
  );

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // ✅ Productos (editable igual que NewOrder)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productForm, setProductForm] = useState({
    gasType: "Tipo 1",
    quantity: 1,
    price: gasPrices["Tipo 1"],
    comment: "",
  });

  const handleNationalIdChange = useCallback(async (newValue: string) => {
    setClientId(newValue);

    const { fullName } = await handleNationalIdLookup(newValue);

    setClientName(fullName);
  }, []);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    OrderService.get(id)
      .then((order: OrderItem) => {
        setExistingOrderData(order);

        setClientId(order.clientId || "");
        setClientName(order.client || "");

        // 👇 poblar productos actuales
        setProducts(order.items || []);

        setIsError(false);
      })
      .catch((error) => {
        console.error("Error fetching order data:", error);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleProductFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setProductForm((prev) => {
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
      const existingIndex = prev.findIndex(
        (p) => p.gasType === productForm.gasType
      );

      if (existingIndex !== -1) {
        return prev.map((p, idx) =>
          idx === existingIndex
            ? {
                ...p,
                quantity: (p.quantity || 0) + (productForm.quantity || 0),
                comment: productForm.comment || p.comment,
                price: productForm.price ?? p.price,
              }
            : p
        );
      }

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

  const fields: FormField[] = useMemo(() => {
    if (!existingOrderData) return [];

    return [
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
        label: "Código de Orden",
        name: "orderCode",
        type: "text",
        value: existingOrderData.orderCode || "",
        validation: { required: true, maxLength: 6 },
        isDisabled: true,
      },
      {
        label: "Fecha y hora de solicitud",
        name: "requestDateTime",
        type: "datetime-local",
        value: existingOrderData.requestDate
          ? existingOrderData.requestDate.slice(0, 16)
          : "",
        validation: { required: true },
        isDisabled: true,
      },
      {
        label: "Comentario adicional",
        name: "comment",
        type: "text",
        value: existingOrderData.comment || "",
        validation: { required: false },
      },
      {
        label: "Ubicación",
        name: "location",
        type: "location",
        helper: "Mueva el marcador solo si necesita ajustar la ubicación",
        value:
          existingOrderData.location ?? {
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
    ];
  }, [
    existingOrderData,
    clientId,
    clientName,
    products,
    productForm,
    handleNationalIdChange,
    handleProductFormChange,
    handleAddProduct,
    handleRemoveProduct,
  ]);

  const handleFormSubmit = async (fieldValues: { [key: string]: any }) => {
    if (!existingOrderData) {
      setIsError(true);
      return;
    }

    const editedOrder: OrderItem = {
      ...existingOrderData,
      clientId: fieldValues.clientId ?? clientId,
      client: fieldValues.clientName ?? clientName,
      location: fieldValues.location ?? existingOrderData.location,
      comment: fieldValues.comment ?? existingOrderData.comment,
      items: products,
      totalAmount: products.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
        0
      ),
    };

    OrderService.edit(existingOrderData.id, editedOrder)
      .then((response) => {
        console.log("Ok:", response);
        triggerRefresh();
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsError(true);
      });
  };

  const closeModalAndRedirect = () => {
    setShowModal(false);
    history.push("/admin/order/index");
  };

  if (isError) return <Error />;

  if (isLoading || !existingOrderData) {
    return (
      <Center>
        <Spinner size="xl" color={spinnerColor} />
      </Center>
    );
  }

  return (
    <>
      <Form
        title="Actualización de Orden"
        button="Actualizar Orden"
        back="/admin/order/index"
        fields={fields}
        onSubmit={handleFormSubmit}
      />
      {showModal && (
        <OkModal
          message="Orden editada correctamente."
          isOpen={showModal}
          onClose={closeModalAndRedirect}
        />
      )}
    </>
  );
}