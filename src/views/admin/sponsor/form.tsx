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
import { MdArrowBack, MdInfoOutline, MdVisibility } from 'react-icons/md';
import Card from 'components/card/Card';
import SponsorService from 'services/SponsorService';
import { BUSINESS_CATEGORIES, DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';

const empty = { name: '', category: DEFAULT_BUSINESS_CATEGORY, active: true, order: 1, logoUrl: '', videoUrl: '', links: ['', '', '', ''], description: '' };
const MAX_FIRESTORE_VIDEO_BYTES = 850 * 1024;

export default function SponsorForm() {
  const { id } = useParams();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const sectionBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const headerBg = useColorModeValue('linear(to-r, white, brand.50)', 'linear(to-r, navy.800, navy.700)');

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
      const cleanLinks = sponsor.links.filter(Boolean).slice(0, 4);
      const payload = {
        ...sponsor,
        name: sponsor.name?.trim() || '',
        description: sponsor.description?.trim() || '',
        order: Number(sponsor.order),
        links: cleanLinks,
        videoUrl: sponsor.videoUrl || '',
      };
      if (id) {
        await SponsorService.edit(id, { ...payload, id });
      } else {
        await SponsorService.create(payload);
      }
      history.push('/admin/sponsor/index');
    } catch (error) {
      console.error('[SponsorForm] Error guardando patrocinador:', error);
      showMessage('error', 'No se pudo guardar el patrocinador. Si adjuntaste video, probá con un archivo más liviano o con un link externo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '86px', md: '80px' }} px={{ base: '0px', md: '0px' }} pb="36px">
      <Card p={{ base: '18px', md: '24px' }} mb="22px" bgGradient={headerBg}>
        <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" gap="16px" direction={{ base: 'column', md: 'row' }}>
          <HStack spacing="14px" align="flex-start">
            <Button aria-label="Volver a patrocinadores" leftIcon={<MdArrowBack />} variant="ghost" onClick={() => history.push('/admin/sponsor/index')} flexShrink={0}>Volver</Button>
            <Box>
              <Heading fontSize={{ base: '24px', md: '32px' }}>{id ? 'Editar patrocinador' : 'Nuevo patrocinador'}</Heading>
              <Text color={muted} mt="4px">Configurá su presencia pública, enlaces y contenido visual en un solo lugar.</Text>
            </Box>
          </HStack>
          <HStack spacing="8px" flexWrap="wrap">
            <Badge px="10px" py="5px" borderRadius="full" colorScheme="brand">{sponsor.category}</Badge>
            <Badge px="10px" py="5px" borderRadius="full" colorScheme={sponsor.active ? 'green' : 'gray'}>{sponsor.active ? 'Visible' : 'Oculto'}</Badge>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: '18px', md: '24px' }} alignItems="start">
        <Card bg={cardBg} p={{ base: '16px', md: '24px' }} overflow="hidden">
          <Stack spacing="20px">
          {message && <Alert status={message.status} borderRadius="14px"><AlertIcon />{message.text}</Alert>}

          <Stack spacing="4px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <HStack spacing="8px" flexWrap="wrap">
              <Badge colorScheme="brand">{sponsor.category}</Badge>
              <Badge colorScheme={sponsor.active ? 'green' : 'gray'}>{sponsor.active ? 'Activo' : 'Oculto'}</Badge>
            </HStack>
            <Text fontWeight="800" fontSize={{ base: 'lg', md: 'xl' }}>Datos principales</Text>
            <Text color={muted} fontSize="sm">Organizá el orden dentro de esta categoría del centro comercial.</Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <FormControl>
              <FormLabel>Título / nombre</FormLabel>
              <Input value={sponsor.name} placeholder="Ej. Restaurante El Centro" onChange={(e) => set('name', e.target.value)} />
              <FormHelperText>Opcional. Si queda vacío, el card muestra solo el logo y links.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Categoría comercial</FormLabel>
              <Select value={sponsor.category} onChange={(e) => set('category', e.target.value)}>{BUSINESS_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</Select>
            </FormControl>
            <FormControl>
              <FormLabel>Orden</FormLabel>
              <Input type="number" min="1" value={sponsor.order} onChange={(e) => set('order', e.target.value)} />
              <FormHelperText>Define la posición del negocio dentro de su categoría.</FormHelperText>
            </FormControl>
            <FormControl display="flex" alignItems="center" gap="10px" pt={{ base: 0, md: '30px' }}>
              <Switch isChecked={sponsor.active} onChange={(e) => set('active', e.target.checked)} />
              <FormLabel mb="0">Mostrar públicamente</FormLabel>
            </FormControl>
          </SimpleGrid>

          <Divider />

          <Stack spacing="12px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Contenido visual</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              <FormControl>
                <FormLabel>Subir logo</FormLabel>
                <Input type="file" accept="image/*" onChange={(e) => readFile('logoUrl', e.target.files?.[0])} />
                <FormHelperText>Recomendado: PNG o JPG horizontal con fondo transparente o claro.</FormHelperText>
              </FormControl>
              <FormControl>
                  <FormLabel>Link o iframe de video</FormLabel>
                  <Input value={sponsor.videoUrl?.startsWith('data:') ? '' : sponsor.videoUrl} placeholder='<iframe src="https://..."></iframe> o https://...' onChange={(e) => set('videoUrl', e.target.value)} />
                  <FormHelperText>Opcional. Pegá iframe o link embed público para evitar límites de guardado.</FormHelperText>
                </FormControl>
              <FormControl>
                  <FormLabel>O subir video pequeño</FormLabel>
                  <Input type="file" accept="video/*" onChange={(e) => readFile('videoUrl', e.target.files?.[0])} />
                  <FormHelperText>Opcional, menor a 850 KB. Si falla al guardar, usá el link de video.</FormHelperText>
                </FormControl>
            </SimpleGrid>
          </Stack>

          <FormControl p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <FormLabel>Descripción</FormLabel>
            <Textarea value={sponsor.description} placeholder="Mensaje corto del negocio, promoción o categoría." onChange={(e) => set('description', e.target.value)} />
            <FormHelperText>Opcional. Usá una frase corta para que no sature el card.</FormHelperText>
          </FormControl>

          <Stack spacing="12px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Links de contacto</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              {sponsor.links.map((link, i) => (
                <FormControl key={i}>
                  <FormLabel>Link {i + 1}</FormLabel>
                  <Input value={link} placeholder="https://, wa.me/ o correo" onChange={(e) => set('links', sponsor.links.map((l, idx) => idx === i ? e.target.value : l))} />
                </FormControl>
              ))}
            </SimpleGrid>
          </Stack>

          <Stack direction={{ base: 'column', sm: 'row' }} spacing="12px" pt="4px">
            <Button colorScheme="brand" size="lg" onClick={save} isLoading={saving} loadingText="Guardando" w={{ base: '100%', sm: 'auto' }}>Guardar patrocinador</Button>
            <Button variant="outline" isDisabled={saving} onClick={() => history.push('/admin/sponsor/index')} w={{ base: '100%', sm: 'auto' }}>Cancelar</Button>
          </Stack>
          </Stack>
        </Card>

        <Card p={{ base: '16px', md: '20px' }} position={{ xl: 'sticky' }} top={{ xl: '90px' }} border="1px solid" borderColor="brand.100">
          <Stack spacing="12px">
          <HStack><Box p="8px" borderRadius="full" bg="brand.50" color="brand.500"><MdVisibility size="20px" /></Box><Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Previsualización en vivo</Text></HStack>
          <Text color={muted} fontSize="sm">Revisá el resultado antes de guardar. Los contactos se despliegan al tocar el logo.</Text>
          <Box p={{ base: '14px', md: '18px' }} borderRadius="16px" bg={sectionBg}><Badge colorScheme="brand">{sponsor.category}</Badge><Text fontWeight="900" fontSize="xl" mt="8px">{sponsor.name || 'Nombre del negocio'}</Text><Text color={muted} fontSize="sm" mt="4px">{sponsor.description || 'La descripción aparecerá en la tarjeta del centro comercial.'}</Text></Box>
          <HStack color={muted} fontSize="xs"><MdInfoOutline /><Text>Los cambios se publican al guardar.</Text></HStack>
          </Stack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
