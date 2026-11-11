import { Button, Input, Stack, Text, useToast } from '@chakra-ui/react';
import AppModal from 'components/modal/AppModal';
import { useRef, useState } from 'react';
import { MdShare } from 'react-icons/md';
import { businessShareUrl } from 'utils/shareBusiness';

export default function ShareBusinessButton({ businessId, name }: { businessId: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const share = async () => {
    if (busy) return;
    setBusy(true);
    const url = businessShareUrl(businessId, window.location.href);
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: name || 'Negocio local', text: `Conocé ${name || 'este negocio'} en el Centro Comercial Virtual de Acosta.`, url });
          return;
        } catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
      }
      if (!navigator.clipboard?.writeText) { setManualLink(url); return; }
      try { await navigator.clipboard.writeText(url); toast({ status: 'success', title: 'Enlace del negocio copiado' }); }
      catch { setManualLink(url); }
    } finally { setBusy(false); }
  };
  return <>
    <Button ref={trigger} onClick={share} aria-label="Compartir negocio" leftIcon={<MdShare />} isLoading={busy} flex="1" minW={0} minH="44px" fontSize="sm" whiteSpace="nowrap" variant="outline" color="cyan.100" borderColor="whiteAlpha.400" borderRadius="full" _hover={{ bg: 'whiteAlpha.100' }}>Compartir</Button>
    <AppModal isOpen={Boolean(manualLink)} onClose={() => setManualLink('')} finalFocusRef={trigger} title="Compartir negocio" size="md" footer={<Button onClick={() => setManualLink('')} colorScheme="brand">Listo</Button>}>
      <Stack spacing={3}><Text>Copiá este enlace para compartir el negocio.</Text><Input aria-label="Enlace del negocio" value={manualLink} isReadOnly onFocus={event => event.target.select()} /></Stack>
    </AppModal>
  </>;
}
