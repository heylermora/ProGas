// @ts-nocheck
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
import productService from "services/ProductService";

import { OrderItem, ProductItem } from "interfaces/OrderItem";
import type { Product } from "interfaces/Product";
import FormField from "interfaces/FormField";
import Error from "components/exceptions/Error";
import { useOrderRefresh } from "contexts/OrderRefreshContext";
import { handleNationalIdLookup } from "utils/nationalId";

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

  const [existingOrderData, setExistingOrderData] = useState<OrderItem | null>(null);

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // ✅ catálogo desde service
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  // ✅ productos actuales del pedido
  const [products, setProducts] = useState<ProductItem[]>([]);

  // ✅ form de item (usa productId)
  const [productForm, setProductForm] = useState({
    productId: "",
    quantity: 1,
    price: 0,
    comment: "",
  });

  const selectedProduct = useMemo(() => {
    return catalog.find((p) => p.id === productForm.productId) ?? null;
  }, [catalog, productForm.productId]);

  const handleNationalIdChange = useCallback(async (newValue: string) => {
    setClientId(newValue);
    const { fullName } = await handleNationalIdLookup(newValue);
    setClientName(fullName);
  }, []);

  // 1) cargar catálogo
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsCatalogLoading(true);
        const data = await productService.getAll();
        if (!mounted) return;

        const list = (data ?? []) as Product[];
        setCatalog(list);

        const first = list[0];
        if (first) {
          setProductForm((prev) => ({
            ...prev,
            productId: first.id,
            price: Number(first.price ?? 0),
          }));
        }
      } catch (e) {
        console.error("Error fetching products catalog:", e);
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setIsCatalogLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 2) cargar orden
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    OrderService.get(id)
      .then((order: OrderItem) => {
        setExistingOrderData(order);

        setClientId(order.clientId || "");
        setClientName(order.client || "");

        setProducts(order.items || []);
        setIsError(false);
      })
      .catch((error) => {
        console.error("Error fetching order data:", error);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // 3) normalizar items viejos: intentar setear productId por match con description
  useEffect(() => {
    if (!catalog.length || !products.length) return;

    setProducts((prev) =>
      prev.map((it) => {
        if (it.productId) return it;

        const match = catalog.find(
          (p) =>
            (p.description ?? "").toUpperCase() === (it.gasType ?? "").toUpperCase()
        );

        if (!match) return it;

        return {
          ...it,
          productId: match.id,
          gasType: match.description,
          price: Number(match.price ?? it.price ?? 0),
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.length]);

  const handleProductFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setProductForm((prev) => {
      if (name === "productId") {
        const p = catalog.find((x) => x.id === value);
        return {
          ...prev,
          productId: value,
          price: Number(p?.price ?? 0),
        };
      }

      return {
        ...prev,
        [name]: name === "quantity" || name === "price" ? Number(value) : value,
      };
    });
  };

  const handleAddProduct = () => {
    const p = catalog.find((x) => x.id === productForm.productId);
    if (!p) return;

    setProducts((prev) => {
      const existingIndex = prev.findIndex((it) =>
        it.productId ? it.productId === p.id : it.gasType === p.description
      );

      if (existingIndex !== -1) {
        return prev.map((it, idx) =>
          idx === existingIndex
            ? {
                ...it,
                productId: p.id,
                gasType: p.description,
                quantity: (it.quantity || 0) + (productForm.quantity || 0),
                comment: productForm.comment || it.comment,
                price: Number(p.price ?? it.price ?? 0),
              }
            : it
        );
      }

      return [
        ...prev,
        {
          productId: p.id,
          gasType: p.description,
          quantity: productForm.quantity,
          price: Number(p.price ?? 0),
          comment: productForm.comment,
        },
      ];
    });

    const first = catalog[0];
    setProductForm({
      productId: first?.id ?? "",
      quantity: 1,
      price: Number(first?.price ?? 0),
      comment: "",
    });
  };

  const handleRemoveProduct = (item: ProductItem) => {
    setProducts((prev) =>
      prev.filter((p) =>
        item.productId ? p.productId !== item.productId : p.gasType !== item.gasType
      )
    );
  };

  const renderProductFormFields = (
    form: typeof productForm,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void
  ) => (
    <Flex gap={3} wrap="wrap">
      <Box>
        <Text fontSize="xs" mb={1}>
          Producto
        </Text>
        <Select
          isRequired
          variant="auth"
          fontSize="sm"
          name="productId"
          value={form.productId}
          onChange={onChange}
          size="md"
          maxW="260px"
          isDisabled={isCatalogLoading || catalog.length === 0}
        >
          {catalog.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description}
            </option>
          ))}
        </Select>

        {selectedProduct && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            Precio actual: ₡{Number(selectedProduct.price ?? 0)}
          </Text>
        )}
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
          maxW="80px"
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
        helper: clientName ? "¡Cliente encontrado!" : "Sin espacios ni guiones. Solo dígitos.",
        validation: { required: true, regex: /^\d+$/ },
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
        value: existingOrderData.requestDate ? existingOrderData.requestDate.slice(0, 16) : "",
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
          isDisabled: isCatalogLoading || catalog.length === 0,
        },
      },
    ];
  }, [
    existingOrderData,
    clientId,
    clientName,
    products,
    productForm,
    isCatalogLoading,
    catalog.length,
    handleNationalIdChange,
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