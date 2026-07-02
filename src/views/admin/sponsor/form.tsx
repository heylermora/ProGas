// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { useHistory, useParams } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import SponsorStrip from 'views/public/SponsorStrip';

const empty = { name: '', type: 'VIP', active: true, order: 1, logoUrl: '', videoUrl: '', links: ['', '', '', ''], description: '' };
const MAX_FIRESTORE_VIDEO_BYTES = 850 * 1024;

export default function SponsorForm() {
  const { id } = useParams();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => { if (id) SponsorService.get(id).then((s) => setSponsor({ ...empty, ...s, links: [...(s.links || []), '', '', '', ''].slice(0, 4) })); }, [id]);

  const set = (key, value) => setSponsor((prev) => ({ ...prev, [key]: value }));
  const showMessage = (status, text) => setMessage({ status, text });

  const readFile = (key, file) => {
    if (!file) return;

    if (key === 'videoUrl' && file.size > MAX_FIRESTORE_VIDEO_BYTES) {
      showMessage('warning', 'El video es muy pesado para guardarlo directo. Pegá un link de video público o subí un archivo menor a 850 KB para esta demo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      set(key, reader.result);
      showMessage('success', key === 'videoUrl' ? 'Video cargado para previsualización. Guardá para aplicarlo.' : 'Archivo cargado para previsualización.');
    };
    reader.onerror = () => showMessage('error', 'No se pudo leer el archivo. Intentá nuevamente o usá un link.');
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const cleanLinks = sponsor.links.filter(Boolean).slice(0, sponsor.type === 'General' ? 1 : 4);
      const payload = {
        ...sponsor,
        name: sponsor.name?.trim() || '',
        description: sponsor.description?.trim() || '',
        order: Number(sponsor.order),
        links: cleanLinks,
        videoUrl: sponsor.type === 'VIP' ? sponsor.videoUrl : '',
      };
      if (id) await SponsorService.edit(id, { ...payload, id }); else await SponsorService.create(payload);
      history.push('/admin/sponsor/index');
    } catch (error) {
      console.error('[SponsorForm] Error guardando patrocinador:', error);
      showMessage('error', 'No se pudo guardar el patrocinador. Si adjuntaste video, probá con un archivo más liviano o con un link externo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '40px', md: '40px' }} px={{ base: '0px', md: '0px' }}>
      <Stack spacing="6px" mb="20px">
        <Heading fontSize={{ base: '28px', md: '36px' }}>{id ? 'Editar' : 'Nuevo'} patrocinador</Heading>
        <Text color={muted}>Completá solo la información necesaria. El título y la descripción pueden quedar vacíos.</Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: '18px', md: '24px' }} alignItems="start">
        <Stack bg={cardBg} p={{ base: '16px', md: '24px' }} borderRadius={{ base: '18px', md: '24px' }} boxShadow="md" spacing="18px" overflow="hidden">
          {message && <Alert status={message.status} borderRadius="14px"><AlertIcon />{message.text}</Alert>}

          <Stack spacing="4px">
            <HStack spacing="8px" flexWrap="wrap">
              <Badge colorScheme={sponsor.type === 'VIP' ? 'yellow' : sponsor.type === 'Premium' ? 'purple' : 'green'}>{sponsor.type}</Badge>
              <Badge colorScheme={sponsor.active ? 'green' : 'gray'}>{sponsor.active ? 'Activo' : 'Oculto'}</Badge>
            </HStack>
            <Text fontWeight="800" fontSize={{ base: 'lg', md: 'xl' }}>Datos principales</Text>
            <Text color={muted} fontSize="sm">El orden se usa dentro de cada tipo de sponsor y también se puede ajustar arrastrando desde el listado.</Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
            <FormControl>
              <FormLabel>Título / nombre</FormLabel>
              <Input value={sponsor.name} placeholder="Ej. Restaurante El Centro" onChange={(e) => set('name', e.target.value)} />
              <FormHelperText>Opcional. Si queda vacío, el card muestra solo el logo y links.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Tipo</FormLabel>
              <Select value={sponsor.type} onChange={(e) => set('type', e.target.value)}><option>VIP</option><option>Premium</option><option>General</option></Select>
            </FormControl>
            <FormControl>
              <FormLabel>Orden</FormLabel>
              <Input type="number" min="1" value={sponsor.order} onChange={(e) => set('order', e.target.value)} />
            </FormControl>
            <FormControl display="flex" alignItems="center" gap="10px" pt={{ base: 0, md: '30px' }}>
              <Switch isChecked={sponsor.active} onChange={(e) => set('active', e.target.checked)} />
              <FormLabel mb="0">Mostrar públicamente</FormLabel>
            </FormControl>
          </SimpleGrid>

          <Divider />

          <Stack spacing="12px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Contenido visual</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              <FormControl>
                <FormLabel>Subir logo</FormLabel>
                <Input type="file" accept="image/*" onChange={(e) => readFile('logoUrl', e.target.files?.[0])} />
                <FormHelperText>Recomendado: PNG o JPG horizontal con fondo transparente o claro.</FormHelperText>
              </FormControl>
              {sponsor.type === 'VIP' && (
                <FormControl>
                  <FormLabel>Link o iframe de video VIP</FormLabel>
                  <Input value={sponsor.videoUrl?.startsWith('data:') ? '' : sponsor.videoUrl} placeholder='<iframe src="https://..."></iframe> o https://...' onChange={(e) => set('videoUrl', e.target.value)} />
                  <FormHelperText>Opcional. Pegá iframe o link embed público para evitar límites de guardado.</FormHelperText>
                </FormControl>
              )}
              {sponsor.type === 'VIP' && (
                <FormControl>
                  <FormLabel>O subir video pequeño VIP</FormLabel>
                  <Input type="file" accept="video/*" onChange={(e) => readFile('videoUrl', e.target.files?.[0])} />
                  <FormHelperText>Opcional, menor a 850 KB. Si falla al guardar, usá el link de video.</FormHelperText>
                </FormControl>
              )}
            </SimpleGrid>
          </Stack>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea value={sponsor.description} placeholder="Mensaje corto del negocio, promoción o categoría." onChange={(e) => set('description', e.target.value)} />
            <FormHelperText>Opcional. Usá una frase corta para que no sature el card.</FormHelperText>
          </FormControl>

          <Stack spacing="12px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Links de contacto</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              {sponsor.links.map((link, i) => (
                <FormControl key={i} isDisabled={sponsor.type === 'General' && i > 0}>
                  <FormLabel>Link {i + 1}</FormLabel>
                  <Input value={link} placeholder="https://, wa.me/ o correo" onChange={(e) => set('links', sponsor.links.map((l, idx) => idx === i ? e.target.value : l))} />
                  {sponsor.type === 'General' && i === 0 && <FormHelperText>General permite 1 link.</FormHelperText>}
                </FormControl>
              ))}
            </SimpleGrid>
          </Stack>

          <Stack direction={{ base: 'column', sm: 'row' }} spacing="12px">
            <Button colorScheme="brand" onClick={save} isLoading={saving} loadingText="Guardando" w={{ base: '100%', sm: 'auto' }}>Guardar</Button>
            <Button variant="outline" isDisabled={saving} onClick={() => history.push('/admin/sponsor/index')} w={{ base: '100%', sm: 'auto' }}>Cancelar</Button>
          </Stack>
        </Stack>

        <Stack spacing="12px" position={{ xl: 'sticky' }} top={{ xl: '90px' }}>
          <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Previsualización</Text>
          <Text color={muted} fontSize="sm">Así se verá el card con los datos actuales. Guardá para publicarlo.</Text>
          <SponsorStrip type={sponsor.type} max={1} previewSponsor={{ ...sponsor, id: id || 'preview', active: true }} />
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
