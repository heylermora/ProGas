import { Button, Stack, Textarea, useToast } from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';
import AppModal from './AppModal';

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


  return <AppModal title="Copiar información" isOpen={isOpen} onClose={onClose}
    footer={<Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
      <Button type="button" flex="1" colorScheme="whatsapp" onClick={handleSendWhatsApp} leftIcon={<FaWhatsapp />}>Enviar por WhatsApp</Button>
      <Button type="button" flex="1" variant="brand" onClick={handleCopy}>Copiar</Button>
    </Stack>}>
    <Stack spacing={3}>{message}
      <Textarea aria-label="Información para copiar" value={copyText} isReadOnly rows={8} minH="160px" resize="none" />
    </Stack>
  </AppModal>;
}

export default CopyModal;
