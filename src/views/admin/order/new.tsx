// @ts-nocheck
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Text, Input, Select, Flex } from "@chakra-ui/react";
import { customAlphabet } from "nanoid";
import { useHistory } from "react-router-dom";

import Form from "components/form/Form";
import OkModal from "components/modal/OkModal";
import orderService from "services/OrderService";
import productService from "services/ProductService";

import { OrderItem, ProductItem } from "interfaces/OrderItem";
import type { Product } from "interfaces/Product";
import FormField from "interfaces/FormField";
import Error from "components/exceptions/Error";
import { handleNationalIdLookup } from "utils/nationalId";

const nano = customAlphabet("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789", 6);

export default function NewOrder() {
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // productos del pedido (lo que ya tenías)
  const [products, setProducts] = useState<ProductItem[]>([]);

  // catálogo (viene del service)
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  const history = useHistory();

  // form de producto: ahora el "gasType" será el id del producto seleccionado
  const [productForm, setProductForm] = useState({
    productId: "",
    quantity: 1,
    price: 0,
    comment: "",
  });

  // Fetch catálogo desde Firestore
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsCatalogLoading(true);
        const data = await productService.getAll();
        if (!mounted) return;

        const list = (data ?? []) as Product[];
        setCatalog(list);

        // set defaults del select
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
        if (!mounted) return;
        setIsError(true);
      } finally {
        if (mounted) setIsCatalogLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedProduct = useMemo(() => {
    return catalog.find((p) => p.id === productForm.productId) ?? null;
  }, [catalog, productForm.productId]);

  const handleNationalIdChange = useCallback(async (newValue: string) => {
    setClientId(newValue);

    const { fullName } = await handleNationalIdLookup(newValue);

    setClientName(fullName);
  }, []);

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
      const existingIndex = prev.findIndex((it) => it.productId === p.id);

      // si ya existe, suma cantidad
      if (existingIndex !== -1) {
        return prev.map((it, idx) =>
          idx === existingIndex
            ? {
                ...it,
                quantity: (it.quantity || 0) + (productForm.quantity || 0),
                comment: productForm.comment || it.comment,
              }
            : it
        );
      }

      // nuevo
      return [
        ...prev,
        {
          productId: p.id,
          gasType: p.description, // para que tus cards/mensajes sigan diciendo "Pedido de ..."
          quantity: productForm.quantity,
          price: Number(p.price ?? 0),
          comment: productForm.comment,
        },
      ];
    });

    // reset
    const first = catalog[0];
    setProductForm({
      productId: first?.id ?? "",
      quantity: 1,
      price: Number(first?.price ?? 0),
      comment: "",
    });
  };

  const handleRemoveProduct = (item: ProductItem) => {
    // preferimos por productId, pero si no existe, cae a gasType
    setProducts((prev) =>
      prev.filter((p) => (item.productId ? p.productId !== item.productId : p.gasType !== item.gasType))
    );
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

  const fields: FormField[] = useMemo(
    () => [
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
          // opcional: si tu Form soporta "isDisabled" para el módulo items:
          isDisabled: isCatalogLoading || catalog.length === 0,
        },
      },
    ],
    [
      clientId,
      clientName,
      products,
      productForm,
      catalog,
      isCatalogLoading,
      renderProductFormFields,
      handleNationalIdChange,
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
      totalAmount: products.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
        0
      ),
    };

    orderService
      .create(newOrder)
      .then((response: { id: string }) => {
        console.log("Orden creada con ID de Firebase:", response.id);
        setShowModal(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error?.response?.status !== 400) setIsError(true);
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
        title="Nuevo Pedido"
        button="Crear Pedido"
        back="/admin/order/index"
        fields={fields}
        onSubmit={handleFormSubmit}
      />

      {showModal && (
        <OkModal
          message="Pedido creado correctamente."
          isOpen={showModal}
          onClose={closeModalAndRedirect}
        />
      )}
    </>
  );
}