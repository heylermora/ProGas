import { Box, Text } from "@chakra-ui/react";
import OrderProductFields from 'components/form/OrderProductFields';
import { customAlphabet } from "nanoid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

import Form from "components/form/Form";
import OkModal from "components/modal/OkModal";
import orderService from "services/OrderService";
import productService from "services/ProductService";

import Error from "components/exceptions/Error";
import FormField from "interfaces/FormField";
import { OrderItem, ProductItem } from "interfaces/OrderItem";
import type { Product } from "interfaces/ProductItem";
import { handleNationalIdLookup } from "utils/nationalId";

const nano = customAlphabet("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789", 6);

export default function NewOrder() {
  const requestId = useRef(crypto.randomUUID());
  const orderCode = useRef(nano());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  // productos del pedido
  const [products, setProducts] = useState<ProductItem[]>([]);

  // catálogo
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  const history = useHistory();

  // form de producto
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

  const handleProductFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    },
    [catalog]
  );

  const handleAddProduct = useCallback(() => {
    const p = catalog.find((x) => x.id === productForm.productId);
    if (!p) return;

    setProducts((prev) => {
      const existingIndex = prev.findIndex((it) => it.productId === p.id);

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

      return [
        ...prev,
        {
          productId: p.id,
          gasType: p.description,
          quantity: productForm.quantity,
          price: Number(p.price ?? 0),
          unitCost: Number(p.costPrice ?? 0),
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
  }, [catalog, productForm]);

  const handleRemoveProduct = useCallback((item: ProductItem) => {
    setProducts((prev) =>
      prev.filter((p) =>
        item.productId ? p.productId !== item.productId : p.gasType !== item.gasType
      )
    );
  }, []);

  const renderProductItem = useCallback(
    (item: ProductItem) => (
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
    ),
    []
  );

  const renderProductFormFields = useCallback(
    (
      form: typeof productForm,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      ) => void
    ) => (
      <OrderProductFields form={form} onChange={onChange} catalog={catalog} loading={isCatalogLoading} selectedProduct={selectedProduct} />
    ),
    [catalog, isCatalogLoading, selectedProduct]
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
          isDisabled: isCatalogLoading || catalog.length === 0,
        },
      },
    ],
    [
      clientId,
      clientName,
      products,
      productForm,
      isCatalogLoading,
      catalog.length,
      handleNationalIdChange,
      handleAddProduct,
      handleProductFormChange,
      handleRemoveProduct,
      renderProductItem,
      renderProductFormFields,
    ]
  );

  const handleFormSubmit = async (fieldValues: { [key: string]: any }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const newOrder: Omit<OrderItem, "id"> = {
      orderCode: orderCode.current,
      requestId: requestId.current,
      status: "Nuevo",
      requestDate: fieldValues.requestDateTime,
      client: fieldValues.clientName,
      clientId: fieldValues.clientId,
      location: fieldValues.location,
      ...(fieldValues.location?.canonical ? { deliveryAddressSnapshot: fieldValues.location.canonical } : {}),
      comment: fieldValues.comment,
      items: products,
      totalAmount: products.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0),
    };

    try {
      const response = await orderService.createWithStock(newOrder);
      console.log("Orden creada con ID de Firebase:", response.id);
      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModalAndRedirect = () => {
    setShowModal(false);
    history.push("/admin/order/index");
  };

  if (isError) return <Error />;

  return (
    <>
      <Form
        isSubmitting={isSubmitting}
        title="Nuevo pedido"
        button="Crear pedido"
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
