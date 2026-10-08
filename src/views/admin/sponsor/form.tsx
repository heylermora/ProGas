import { Alert, AlertIcon, Box, Button, Image, Input, Select, SimpleGrid, Stack, Switch, Text, Textarea, useColorModeValue } from '@chakra-ui/react';
import Card from 'components/card/Card';
import Form from 'components/form/Form';
import FormField from 'components/form/FormField';
import DeviceLocationMap from 'components/form/DeviceLocationMap';
import ModalSection from 'components/modal/ModalSection';
import SponsorLocation from 'components/sponsor/SponsorLocation';
import useCategories from 'hooks/useCategories';
import SponsorItem, { DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import { networkFor, parseSponsorCoordinates, sponsorContacts, sponsorLinks, sponsorNetworks, sponsorVideoSource } from 'utils/sponsor';

type SponsorFormState = Omit<SponsorItem, 'id'>;
const empty: SponsorFormState = { name: '', category: DEFAULT_BUSINESS_CATEGORY, active: true, order: 1, logoUrl: '', videoUrl: '', links: [], socialLinks: {}, description: '', coordinates: '', directions: '' };

export default function SponsorForm() {
  const { categories } = useCategories('sponsors');
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(empty);
  const [originalVideo, setOriginalVideo] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readingLogo, setReadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const muted = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    let live = true;
    if (!id) { setSponsor(empty); setLoading(false); return; }
    setLoading(true);
    setLoadError(false);
    SponsorService.get(id).then(item => {
      if (!live) return;
      const contacts = sponsorContacts(item);
      setOriginalVideo(item.videoUrl || '');
      setSponsor({ ...empty, ...item, socialLinks: contacts.socials, links: contacts.extra });
    }).catch(() => { if (live) setLoadError(true); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  const set = <K extends keyof SponsorFormState>(key: K, value: SponsorFormState[K]) => setSponsor(previous => ({ ...previous, [key]: value }));
  const readLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 300 * 1024) {
      setMessage('Seleccione una imagen de hasta 300 KB. Reduzca el tamaño del logo antes de adjuntarlo.');
      return;
    }
    setReadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => { set('logoUrl', String(reader.result || '')); setReadingLogo(false); setMessage(''); };
    reader.onerror = () => { setMessage('No se pudo leer el logo. Intente nuevamente.'); setReadingLogo(false); };
    reader.readAsDataURL(file);
  };
  const save = async () => {
    if (saving || loading || loadError || readingLogo) return;
    const nextErrors: Record<string, string> = {};
    sponsorNetworks.forEach(network => {
      const value = sponsor.socialLinks?.[network.key]?.trim();
      if (value && (network.key === 'website' ? !/^https?:\/\//i.test(value) || !networkFor(value) : networkFor(value) !== network.key)) {
        nextErrors[network.key] = network.key === 'email' ? 'Ingrese un correo válido.' : `Ingrese el enlace completo de ${network.label}, empezando con https://.`;
      }
    });
    if (sponsor.coordinates?.trim() && !parseSponsorCoordinates(sponsor.coordinates)) nextErrors.coordinates = 'Ingrese latitud,longitud válidas de Costa Rica, por ejemplo 9.798,-84.162.';
    if (sponsor.videoUrl?.trim() && sponsor.videoUrl !== originalVideo && !sponsorVideoSource(sponsor.videoUrl)) nextErrors.video = 'Use un enlace de YouTube, Vimeo o un archivo público MP4, WebM u OGG.';
    if (!Number.isFinite(sponsor.order) || sponsor.order < 1 || !Number.isInteger(sponsor.order)) nextErrors.order = 'Ingrese una posición entera mayor o igual a 1.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setMessage('Revise los campos indicados antes de guardar.'); return; }
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...sponsor, name: (sponsor.name || '').trim(), description: (sponsor.description || '').trim(), coordinates: (sponsor.coordinates || '').trim(), directions: (sponsor.directions || '').trim(),
        socialLinks: Object.fromEntries(Object.entries(sponsor.socialLinks || {}).map(([key, value]) => [key, value.trim()])),
        links: sponsorLinks(sponsor), videoUrl: (sponsor.videoUrl || '').trim() };
      if (id) await SponsorService.edit(id, { ...payload, id });
      else await SponsorService.create(payload);
      setSaving(false);
      history.push('/admin/sponsor/index');
    } catch { setSaving(false); setMessage('No se pudo guardar el patrocinador. Sus cambios se conservan; intente nuevamente.'); }

  };

  return <Form title={id ? 'Editar patrocinador' : 'Nuevo patrocinador'} description="Prepare la información que verán los clientes en el directorio."
    onBack={() => history.push('/admin/sponsor/index')} submitLabel="Guardar patrocinador" isSubmitting={saving}
    isDisabled={loading || loadError || readingLogo} maxW="1000px" mx="auto" pt="24px" pb="36px"
    onFormSubmit={event => { event.preventDefault(); save(); }}>
    {loading ? <Text role="status">Cargando patrocinador…</Text> : loadError ? <Alert status="error"><AlertIcon />No se pudo cargar el patrocinador. Vuelva al listado e intente nuevamente.</Alert> :
      <Box as="fieldset" disabled={saving || readingLogo} border="0" p="0" m="0" minW="0">
        <Stack spacing={5}>
          {message && <Alert status="error" borderRadius="12px"><AlertIcon />{message}</Alert>}
          <Card p={{ base: 4, md: 6 }}>
            <Stack spacing={4}>
              <Text as="h2" fontWeight="700" fontSize="lg">Información del negocio</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormField label="Nombre del negocio" help="Opcional. Si lo deja vacío, se mostrará el logo."><Input value={sponsor.name} onChange={event => set('name', event.target.value)} placeholder="Nombre comercial" /></FormField>
                <FormField label="Categoría"><Select value={sponsor.category} onChange={event => set('category', event.target.value)}>{Array.from(new Set([sponsor.category, ...categories])).filter(Boolean).map(category => <option key={category}>{category}</option>)}</Select></FormField>
              </SimpleGrid>
              <FormField label="Descripción" help="Opcional. Explique brevemente qué ofrece el negocio."><Textarea value={sponsor.description} onChange={event => set('description', event.target.value)} rows={3} /></FormField>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormField label="Logo" help="Opcional. PNG o JPG de hasta 300 KB."><Input type="file" accept="image/*" onChange={event => readLogo(event.target.files?.[0])} />{sponsor.logoUrl && <Image mt={2} src={sponsor.logoUrl} alt="Logo seleccionado" boxSize="80px" objectFit="contain" />}</FormField>
                <FormField label="Mostrar públicamente" help="Desactívelo para ocultar el negocio sin eliminarlo."><Switch isChecked={sponsor.active} onChange={event => set('active', event.target.checked)} /></FormField>
              </SimpleGrid>
            </Stack>
          </Card>
          <Card p={{ base: 4, md: 6 }}>
            <Stack spacing={4}>
              <Box><Text as="h2" fontWeight="700" fontSize="lg">Redes y contacto</Text><Text fontSize="sm" color={muted}>Todos son opcionales. Complete únicamente los canales del negocio.</Text></Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {sponsorNetworks.map(network => <FormField key={network.key} label={network.label} error={errors[network.key]}>
                  <Input type={network.key === 'email' ? 'email' : 'url'} value={sponsor.socialLinks?.[network.key] || ''} placeholder={network.placeholder}
                    onChange={event => set('socialLinks', { ...sponsor.socialLinks, [network.key]: event.target.value })} />
                </FormField>)}
              </SimpleGrid>
              {sponsor.links.length > 0 && <ModalSection title="Otros enlaces existentes" summary="Se conservan los contactos anteriores que no corresponden a un campo de arriba.">
                <Stack spacing={3}>{sponsor.links.map((link, index) => <FormField key={index} label={`Enlace existente ${index + 1}`}><Input value={link} onChange={event => set('links', sponsor.links.map((value, i) => i === index ? event.target.value : value))} /></FormField>)}</Stack>
              </ModalSection>}
            </Stack>
          </Card>
          <Card p={{ base: 4, md: 6 }}>
            <Stack spacing={4}>
              <Box><Text as="h2" fontWeight="700" fontSize="lg">Ubicación y cómo llegar</Text><Text fontSize="sm" color={muted}>Opcional. El punto exacto genera los botones de Google Maps y Waze; las señas lo complementan.</Text></Box>
              <FormField label="Señas del negocio" help="Indique pueblo, puntos de referencia y cómo reconocer la entrada."><Textarea rows={3} value={sponsor.directions} onChange={event => set('directions', event.target.value)} /></FormField>
              <FormField label="Coordenadas del negocio" help="En Google Maps, mantenga presionado el punto del negocio y copie su latitud y longitud. También puede usar el GPS si está en el local." error={errors.coordinates}>
                <Input value={sponsor.coordinates} placeholder="9.798,-84.162" onChange={event => set('coordinates', event.target.value)} />
              </FormField>
              <ModalSection title="Ubicar con GPS y revisar el mapa" summary="Use esta opción solo si está físicamente en el negocio.">
                <DeviceLocationMap coordinates={parseSponsorCoordinates(sponsor.coordinates) ? sponsor.coordinates : ''} onLocation={location => set('coordinates', location.coordinates)}
                  successMessage="Punto del negocio agregado. Revise que corresponda a la entrada correcta." footnote="El GPS registra su posición actual. Las señas se mantienen como las escribió." />
              </ModalSection>
              <SponsorLocation sponsor={sponsor} />
            </Stack>
          </Card>
          <ModalSection title="Video promocional (opcional)" summary={sponsor.videoUrl ? 'Hay un video agregado. Puede reemplazarlo o quitarlo.' : 'Pegue un enlace de YouTube o Vimeo; no necesita subir archivos aquí.'} reveal={Boolean(errors.video)}>
            <Stack spacing={3}>
              <Text fontSize="sm">1. Suba el video a YouTube (público o no listado) o Vimeo con permiso para insertarlo.</Text>
              <Text fontSize="sm">2. Abra el video, toque Compartir y copie el enlace.</Text>
              <Text fontSize="sm">3. Pegue el enlace aquí y guarde el patrocinador. No pegue código iframe.</Text>
              {sponsor.videoUrl?.startsWith('data:video') ? <Text fontSize="sm">Se conserva el video cargado anteriormente. Para reemplazarlo, quite el video y pegue un enlace.</Text> :
                <FormField label="Enlace del video" help="También admite un enlace directo a un archivo público MP4, WebM u OGG. Un enlace de perfil o una página de Drive no reproduce el video." error={errors.video}>
                  <Input type="url" value={sponsor.videoUrl} onChange={event => set('videoUrl', event.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
                </FormField>}
              {sponsorVideoSource(sponsor.videoUrl) && <Button as="a" href={sponsorVideoSource(sponsor.videoUrl)} target="_blank" rel="noopener noreferrer" variant="outline">Comprobar enlace del video</Button>}
              {sponsor.videoUrl && <Button variant="ghost" onClick={() => set('videoUrl', '')}>Quitar video</Button>}
              <Text fontSize="xs" color={muted}>Compruebe que el video pueda abrirse sin iniciar sesión y que su propietario permita mostrarlo en otros sitios.</Text>
            </Stack>
          </ModalSection>
          <ModalSection title="Orden en el directorio" summary="Puede cambiar la posición arrastrando el negocio desde el listado." reveal={Boolean(errors.order)}>
            <FormField label="Posición dentro de la categoría" error={errors.order}><Input type="number" min={1} step={1} value={sponsor.order} onChange={event => set('order', Number(event.target.value))} /></FormField>
          </ModalSection>
        </Stack>
      </Box>}
  </Form>;
}
