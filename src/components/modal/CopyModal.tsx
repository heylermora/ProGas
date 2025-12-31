import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Textarea,
  Box,
  Flex,
  useToast
} from '@chakra-ui/react';

import TextareaAutosize from "react-textarea-autosize";

type CopyModalProps = {
  message?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  copyText: string;
};

function CopyModal(props: CopyModalProps) {
  const { message, isOpen, onClose, copyText } = props;
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);

      toast({
        title: "Copiado",
        description: "El texto se copió al portapapeles.",
        status: "success",
        duration: 800,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      console.error("Error al copiar", err);

      toast({
        title: "Error",
        description: "No se pudo copiar el texto.",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(copyText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };


  return (
    <Modal colorScheme="blue" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="blue.200" borderRadius="20px">
        <ModalHeader
          bg="white"
          borderTopLeftRadius="20px"
          borderTopRightRadius="20px"
        >
          Copiar información
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {message && (
            <Box mb={4}>
              {message}
            </Box>
          )}

          <Textarea
            as={TextareaAutosize}
            value={copyText}
            isReadOnly
            size="sm"
            mb={2}
            borderRadius="12px"
            variant="subtle"
          />

          <Flex justify="space-between" mt={3}>
            <Button 
              colorScheme="whatsapp" 
              onClick={handleSendWhatsApp}
              leftIcon={<i className="fa-brands fa-whatsapp"></i>}
            >
              Enviar WA
            </Button>

            <Button colorScheme="blue" onClick={handleCopy}>
              Copiar
            </Button>
          </Flex>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CopyModal;