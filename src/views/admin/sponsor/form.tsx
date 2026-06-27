// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Switch, Textarea } from '@chakra-ui/react';
import { useHistory, useParams } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import SponsorStrip from 'views/public/SponsorStrip';

const empty = { name: '', type: 'VIP', active: true, order: 1, logoUrl: '', videoUrl: '', links: ['', '', '', ''], description: '' };

export default function SponsorForm() {
  const { id } = useParams();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(empty);

  useEffect(() => { if (id) SponsorService.get(id).then((s) => setSponsor({ ...empty, ...s, links: [...(s.links || []), '', '', '', ''].slice(0, 4) })); }, [id]);

  const set = (key, value) => setSponsor((prev) => ({ ...prev, [key]: value }));
  const readFile = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set(key, reader.result);
    reader.readAsDataURL(file);
  };
  const save = async () => {
    const cleanLinks = sponsor.links.filter(Boolean).slice(0, sponsor.type === 'General' ? 1 : 4);
    const payload = { ...sponsor, order: Number(sponsor.order), links: cleanLinks, videoUrl: sponsor.type === 'VIP' ? sponsor.videoUrl : '' };
    if (id) await SponsorService.edit(id, { ...payload, id }); else await SponsorService.create(payload);
    history.push('/admin/sponsor/index');
  };

  return (
    <Box pt={{ base: '40px', md: '40px' }} px={{ base: '0px', md: '0px' }}>
      <Heading mb="20px" fontSize={{ base: '28px', md: '36px' }}>{id ? 'Editar' : 'Nuevo'} patrocinador</Heading>
      <Stack bg="white" p={{ base: '16px', md: '24px' }} borderRadius={{ base: '18px', md: '24px' }} boxShadow="md" spacing="16px" overflow="hidden">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
          <FormControl isRequired><FormLabel>Nombre</FormLabel><Input value={sponsor.name} onChange={(e) => set('name', e.target.value)} /></FormControl>
          <FormControl><FormLabel>Tipo</FormLabel><Select value={sponsor.type} onChange={(e) => set('type', e.target.value)}><option>VIP</option><option>Premium</option><option>General</option></Select></FormControl>
          <FormControl><FormLabel>Prioridad de aparición</FormLabel><Input type="number" min="1" value={sponsor.order} onChange={(e) => set('order', e.target.value)} /></FormControl>
          <FormControl display="flex" alignItems="center"><FormLabel mb="0">Activo</FormLabel><Switch isChecked={sponsor.active} onChange={(e) => set('active', e.target.checked)} /></FormControl>
          <FormControl><FormLabel>Subir logo</FormLabel><Input type="file" accept="image/*" onChange={(e) => readFile('logoUrl', e.target.files?.[0])} /></FormControl>
          {sponsor.type === 'VIP' && <FormControl><FormLabel>Subir video VIP (máx. 30 s)</FormLabel><Input type="file" accept="video/*" onChange={(e) => readFile('videoUrl', e.target.files?.[0])} /></FormControl>}
        </SimpleGrid>
        <FormControl><FormLabel>Descripción</FormLabel><Textarea value={sponsor.description} onChange={(e) => set('description', e.target.value)} /></FormControl>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
          {sponsor.links.map((link, i) => <FormControl key={i} isDisabled={sponsor.type === 'General' && i > 0}><FormLabel>Link {i + 1}</FormLabel><Input value={link} onChange={(e) => set('links', sponsor.links.map((l, idx) => idx === i ? e.target.value : l))} /></FormControl>)}
        </SimpleGrid>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing="12px"><Button colorScheme="brand" onClick={save} w={{ base: '100%', sm: 'auto' }}>Guardar</Button><Button variant="outline" onClick={() => history.push('/admin/sponsor/index')} w={{ base: '100%', sm: 'auto' }}>Cancelar</Button></Stack>
      </Stack>
      <Box mt="32px"><SponsorStrip type={sponsor.type} max={1} title="Previsualización del patrocinador seleccionado" previewSponsor={{ ...sponsor, id: id || 'preview', active: true }} /></Box>
    </Box>
  );
}
