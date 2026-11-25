import { Alert, Badge, Button, Flex, Stack, Text, Textarea, useDisclosure, useToast } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import AppModal from 'components/modal/AppModal';
import usePromotionRequests from 'hooks/usePromotionRequests';
import { useEffect, useState } from 'react';
import PromotionService, { PromotionRequest } from 'services/PromotionService';
import { useHistory, useLocation } from 'react-router-dom';
import SponsorForm from './form';

export default function PromotionRequests() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const history = useHistory();
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('solicitudes')) return;
    onOpen();
    history.replace(location.pathname);
  }, [location, history, onOpen]);
  const { requests, status } = usePromotionRequests();
  const [editing, setEditing] = useState<PromotionRequest>();
  const [rejecting, setRejecting] = useState<PromotionRequest>();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const reject = async () => {
    setBusy(true);
    try {
      await PromotionService.reject(rejecting.id, reason);
      setRejecting(undefined);
      toast({ status: 'success', title: 'Solicitud rechazada' });
    } catch {
      toast({ status: 'error', title: 'No se pudo rechazar la solicitud' });
    } finally {
      setBusy(false);
    }
  };
  return <>
    <Button variant="outline" onClick={onOpen}>Solicitudes {requests.length > 0 && <Badge ml={2} colorScheme="brand" aria-live="polite">{requests.length}</Badge>}</Button>
    <AppModal isOpen={isOpen} onClose={() => { setEditing(undefined); setRejecting(undefined); onClose(); }}
      title="Solicitudes de promoción" size={editing ? '4xl' : 'xl'} isBusy={busy}>
      {editing ? <Stack><Button alignSelf="flex-start" variant="outline" onClick={() => setEditing(undefined)}>Ver solicitudes</Button><SponsorForm key={editing.id} request={editing} onReviewed={() => {
        setEditing(undefined);
        toast({ status: 'success', title: 'Solicitud guardada' });
      }} /></Stack> : rejecting ? <Stack spacing={3}>
        <Text>Rechazar la solicitud de {rejecting.sponsor.name}</Text>
        <FormField label="Motivo (opcional)"><Textarea maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></FormField>
        <Flex gap={2}><Button isDisabled={busy} onClick={() => setRejecting(undefined)}>Cancelar</Button><Button colorScheme="red" isLoading={busy} onClick={reject}>Confirmar rechazo</Button></Flex>
      </Stack> : status === 'error' ? <Alert status="error">No se pudieron cargar las solicitudes.</Alert> :
        status === 'loading' ? <Text role="status">Cargando solicitudes…</Text> : requests.length === 0 ? <Text>No hay solicitudes pendientes.</Text> :
          <Stack spacing={3}>{requests.map(request => <Flex key={request.id} borderWidth="1px" borderRadius="lg" p={3} gap={3} justify="space-between" wrap="wrap">
            <Stack spacing={0}><Text fontWeight="bold">{request.sponsor.name}</Text><Text>{request.contactPhone}</Text></Stack>
            <Flex gap={2}><Button size="sm" onClick={() => setEditing(request)}>Revisar y editar</Button><Button size="sm" variant="outline" colorScheme="red" onClick={() => { setReason(''); setRejecting(request); }}>Rechazar</Button></Flex>
          </Flex>)}</Stack>}
    </AppModal>
  </>;
}
