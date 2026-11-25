import { sponsorCategories } from 'utils/sponsorCategories';
import { Alert, AlertIcon, Box, Button, Image, Checkbox, CheckboxGroup, Input, InputGroup, InputLeftAddon, SimpleGrid, Stack, Switch, Text, Textarea } from '@chakra-ui/react';
import Card from 'components/card/Card';
import Form from 'components/form/Form';
import FormField from 'components/form/FormField';
import FormSection from 'components/form/FormSection';
import SocialNetworkLabel from 'components/sponsor/SocialNetworkLabel';
import ModalSection from 'components/modal/ModalSection';
import SponsorLocationFields from 'components/sponsor/SponsorLocationFields';
import { sortCategories } from 'utils/categories';
import { BUSINESS_NAME_REQUIRED, normalizeBusinessName } from 'utils/businessName';
import useCategories from 'hooks/useCategories';
import { DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import SponsorService from 'services/SponsorService';
import { isSponsorMapLink, isSponsorContact, sponsorWhatsAppLink, sponsorWhatsAppPhone, sponsorContacts, sponsorLinks, sponsorNetworks, sponsorVideoSource } from 'utils/sponsor';

import PromotionService, { PromotionRequest, SponsorDetails } from 'services/PromotionService';
import { onlyDigits } from 'utils/phone';

type SponsorFormState = SponsorDetails;
type FormProps = { publicSubmission?: boolean; request?: PromotionRequest; onReviewed?: () => void };
const empty: SponsorFormState = { name: '', category: DEFAULT_BUSINESS_CATEGORY, active: true, order: 1, logoUrl: '', videoUrl: '', links: [], socialLinks: {}, description: '', coordinates: '', mapsUrl: '', wazeUrl: '', directions: '' };

export default function SponsorForm({ publicSubmission, request, onReviewed }: FormProps = {}) {
  const { categories } = useCategories('sponsors');
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(() => ({ ...empty, ...request?.sponsor }));
  const [contactPhone, setContactPhone] = useState(request?.contactPhone || '');
  const [submitted, setSubmitted] = useState(false);
  const requestId = useRef<string>();
  const pending = useRef(false);
  const [originalCategory, setOriginalCategory] = useState(DEFAULT_BUSINESS_CATEGORY);
  const [originalVideo, setOriginalVideo] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readingLogo, setReadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    if (!id) { setSponsor({ ...empty, ...request?.sponsor }); setLoading(false); return; }
    setLoading(true);
    setLoadError(false);
    SponsorService.get(id).then(item => {
      if (!live) return;
      const contacts = sponsorContacts(item);
      setOriginalVideo(item.videoUrl || '');
      setOriginalCategory(item.category || DEFAULT_BUSINESS_CATEGORY);
      setSponsor({ ...empty, ...item, categories: sponsorCategories(item), socialLinks: contacts.socials, links: contacts.extra });
    }).catch(() => { if (live) setLoadError(true); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id, request]);

  const set = <K extends keyof SponsorFormState>(key: K, value: SponsorFormState[K]) => setSponsor(previous => ({ ...previous, ...(key === 'category' ? { categoryId: '' } : {}), [key]: value }));
  const readLogo = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 300 * 1024) {
      setMessage('Seleccione una imagen de hasta 300 KB. Reduzca el tamaño del logo antes de adjuntarlo.');
      return;
    }
    setReadingLogo(true);
    const reader = new FileReader();
    reader.onload = () => { set('logoUrl', String(reader.result || '')); setReadingLogo(false); setMessage(''); };
    reader.onerror = () => { setMessage('No se pudo leer el logo. Intente nuevamente.'); setReadingLogo(false); };
    reader.readAsDataURL(file);
  };
  const save = async (approve = false) => {
    if (pending.current || saving || loading || loadError || readingLogo) return;
    const nextErrors: Record<string, string> = {};
    if (!normalizeBusinessName(sponsor.name)) nextErrors.name = BUSINESS_NAME_REQUIRED;
    if (!sponsorCategories(sponsor).length) nextErrors.categories = 'Seleccione al menos una categoría específica.';
    if ((publicSubmission || request) && !/^\d{8}$/.test(onlyDigits(contactPhone))) nextErrors.contactPhone = 'Ingrese un teléfono de Costa Rica de 8 dígitos.';
    sponsorNetworks.forEach(network => {
      const value = sponsor.socialLinks?.[network.key]?.trim();
      if (value && !isSponsorContact(value, network.key)) {
        nextErrors[network.key] = network.key === 'whatsapp' ? 'Ingrese un número de WhatsApp válido con 8 dígitos.' : network.key === 'email' ? 'Ingrese un correo válido.' : `Ingrese el enlace completo de ${network.label}, empezando con https://.`;
      }
    });
    if (sponsor.videoUrl?.trim() && sponsor.videoUrl !== originalVideo && !sponsorVideoSource(sponsor.videoUrl)) nextErrors.video = 'Use un enlace de YouTube, Vimeo o un archivo público MP4, WebM u OGG.';
    if (sponsor.mapsUrl?.trim() && !isSponsorMapLink(sponsor.mapsUrl)) nextErrors.mapsUrl = 'Pegue un enlace compartido desde Google Maps.';
    if (sponsor.wazeUrl?.trim() && !isSponsorMapLink(sponsor.wazeUrl, 'waze')) nextErrors.wazeUrl = 'Pegue un enlace compartido desde Waze.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setMessage('Revise los campos indicados antes de guardar.'); return; }
    pending.current = true;
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...sponsor, name: (sponsor.name || '').trim(), description: (sponsor.description || '').trim(), coordinates: (sponsor.coordinates || '').trim(), directions: (sponsor.directions || '').trim(), mapsUrl: (sponsor.mapsUrl || '').trim(), wazeUrl: (sponsor.wazeUrl || '').trim(),
        socialLinks: Object.fromEntries(Object.entries(sponsor.socialLinks || {}).map(([key, value]) => [key, value.trim()])),
        links: sponsorLinks(sponsor), videoUrl: (sponsor.videoUrl || '').trim() };
      if (publicSubmission) {
        requestId.current ||= PromotionService.newId();
        await PromotionService.submit(requestId.current, { ...payload, links: [] }, onlyDigits(contactPhone));
      } else if (request) {
        await PromotionService.review(request.id, payload, onlyDigits(contactPhone), approve);
      } else if (id) {
        if (sponsor.category !== originalCategory) payload.order = await SponsorService.nextOrder(sponsor.category);
        await SponsorService.edit(id, { ...payload, id });
      } else {
        await SponsorService.create(payload);
      }
    } catch (error) {
      setMessage(error instanceof Error && error.message === 'La solicitud ya fue tramitada.' ? error.message : 'No se pudieron guardar los cambios. Sus cambios se conservan; intente nuevamente.');
      return;
    } finally {
      pending.current = false;
      setSaving(false);
    }
    if (publicSubmission) setSubmitted(true);
    else if (request) onReviewed?.();
    else history.push('/admin/sponsor/index');

  };

  if (submitted) return <Alert status="success" role="status"><AlertIcon />Recibimos su solicitud. Está en revisión para aprobación.</Alert>;
  const title = publicSubmission ? 'Quiero promocionar mi negocio' : request ? 'Revisar solicitud' : id ? 'Editar patrocinador' : 'Nuevo patrocinador';
  return <Card maxW="1000px" mx="auto" mt="24px" mb="36px" p={{ base: 4, md: 6 }}><Form aria-label={title} title={title} description={publicSubmission ? 'Complete los datos de su comercio. Revisaremos la solicitud antes de publicarla.' : 'Prepará la información que verán los clientes en el directorio.'}
    onBack={publicSubmission || request ? undefined : () => history.push('/admin/sponsor/index')} submitLabel={publicSubmission ? 'Enviar solicitud' : request ? 'Guardar edición' : 'Guardar patrocinador'} isSubmitting={saving}
    isDisabled={loading || loadError || readingLogo} pt={0} pb={0}
    onFormSubmit={event => { event.preventDefault(); save(); }}>
    {loading ? <Text role="status">Cargando patrocinador…</Text> : loadError ? <Alert status="error"><AlertIcon />No se pudo cargar el patrocinador. Vuelva al listado e intente nuevamente.</Alert> :
      <Box as="fieldset" disabled={saving || readingLogo} border="0" p="0" m="0" minW="0">
        <Stack spacing={5}>
          {message && <Alert status="error" borderRadius="12px"><AlertIcon />{message}</Alert>}
          {(publicSubmission || request) && <FormField label="Teléfono de contacto" isRequired error={errors.contactPhone} help="Se usa para contactarle sobre la solicitud. Es privado."><Input type="tel" autoComplete="tel-national" value={contactPhone} onChange={event => setContactPhone(event.target.value)} /></FormField>}
          <FormSection title="Información del negocio" first>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormField label="Nombre del negocio" isRequired error={errors.name} help="Nombre comercial que se mostrará en el directorio y las estadísticas."><Input maxLength={publicSubmission ? 200 : undefined} value={sponsor.name || ''} onChange={event => set('name', event.target.value)} placeholder="Nombre comercial" /></FormField>
                <FormField label="Categorías específicas" isRequired error={errors.categories} help="Seleccione todas las que correspondan al negocio.">
                  <CheckboxGroup value={sponsorCategories(sponsor)} onChange={values => {
                    const selected = values.map(String);
                    setSponsor(previous => ({ ...previous, categories: selected, categoryIds: [], category: selected[0] || '', categoryId: '' }));
                  }}><SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} role="group" aria-label="Categorías específicas">
                    {sortCategories([...sponsorCategories(sponsor), ...categories]).map(category => <Checkbox key={category} value={category}>{category}</Checkbox>)}
                  </SimpleGrid></CheckboxGroup>
                </FormField>
              </SimpleGrid>
              <FormField label="Descripción" help="Opcional. Una frase sobre lo que ofrece."><Textarea maxLength={publicSubmission ? 4000 : undefined} value={sponsor.description} onChange={event => set('description', event.target.value)} rows={3} /></FormField>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormField label="Logo" help="Opcional. Imagen PNG, JPG, WebP o GIF de hasta 300 KB."><Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => readLogo(event.target.files?.[0])} />{sponsor.logoUrl && <Image mt={2} src={sponsor.logoUrl} alt="Logo seleccionado" boxSize="80px" objectFit="contain" />}</FormField>
                {!publicSubmission && !request && <FormField label="Mostrar públicamente" help="Desactívelo para ocultar el negocio sin eliminarlo."><Switch isChecked={sponsor.active} onChange={event => set('active', event.target.checked)} /></FormField>}
              </SimpleGrid>
          </FormSection>
          <FormSection title="Redes y contacto" description="Todos son opcionales. Complete únicamente los canales del negocio.">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {sponsorNetworks.map(network => <FormField key={network.key} label={<SocialNetworkLabel network={network.key} label={network.label} />} error={errors[network.key]} help={network.key === 'whatsapp' ? 'Costa Rica (+506). Ingrese los 8 dígitos del teléfono.' : undefined}>
                  <InputGroup>
                    {network.key === 'whatsapp' && <InputLeftAddon px={2} fontSize="sm">https://wa.me/506</InputLeftAddon>}
                  <Input minW={0} maxLength={publicSubmission ? network.key === 'email' ? 254 : 2048 : undefined} type={network.key === 'whatsapp' ? 'tel' : network.key === 'email' ? 'email' : 'url'} value={network.key === 'whatsapp' ? sponsorWhatsAppPhone(sponsor.socialLinks?.whatsapp) : sponsor.socialLinks?.[network.key] || ''} placeholder={network.key === 'whatsapp' ? '8888-8888' : network.placeholder}
                    onChange={event => set('socialLinks', { ...sponsor.socialLinks, [network.key]: network.key === 'whatsapp' ? sponsorWhatsAppLink(event.target.value) : event.target.value })} />
                  </InputGroup>
                </FormField>)}
              </SimpleGrid>
              {sponsor.links.length > 0 && <ModalSection title="Otros enlaces existentes" summary="Se conservan los contactos anteriores que no corresponden a un campo de arriba.">
                <Stack spacing={3}>{sponsor.links.map((link, index) => <FormField key={index} label={`Enlace existente ${index + 1}`}><Input value={link} onChange={event => set('links', sponsor.links.map((value, i) => i === index ? event.target.value : value))} /></FormField>)}</Stack>
              </ModalSection>}
          </FormSection>
          <FormSection title="Ubicación y cómo llegar">
              <SponsorLocationFields value={sponsor} errors={errors}
                onChange={location => setSponsor(previous => ({ ...previous, ...location }))} />
          </FormSection>
          <FormSection title="Video promocional" description="Opcional. Pegue un enlace de YouTube o Vimeo.">
              {sponsor.videoUrl?.startsWith('data:video') ? <Text fontSize="sm">Se conserva el video cargado anteriormente. Para reemplazarlo, quite el video y pegue un enlace.</Text> :
                <FormField label="Enlace del video" help="Enlace público que abra sin iniciar sesión." error={errors.video}>
                  <Input type="url" maxLength={publicSubmission ? 2048 : undefined} value={sponsor.videoUrl} onChange={event => set('videoUrl', event.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
                </FormField>}
              {sponsorVideoSource(sponsor.videoUrl) && <Button as="a" href={sponsorVideoSource(sponsor.videoUrl)} target="_blank" rel="noopener noreferrer" variant="link" alignSelf="flex-start">Comprobar enlace del video</Button>}
              {sponsor.videoUrl && <Button variant="link" alignSelf="flex-start" onClick={() => set('videoUrl', '')}>Quitar video</Button>}
              <ModalSection title="Cómo agregar el video" reveal={Boolean(errors.video)}>
                <Stack spacing={2}>
              <Text fontSize="sm">1. Suba el video a YouTube (público o no listado) o Vimeo con permiso para insertarlo.</Text>
              <Text fontSize="sm">2. Abra el video, toque Compartir y copie el enlace.</Text>
              <Text fontSize="sm">3. Pegue el enlace aquí y guarde el patrocinador. No pegue código iframe.</Text>
                  <Text fontSize="sm">También admite archivos públicos MP4, WebM u OGG; un perfil o una página de Drive no reproduce el video.</Text>
                  <Text fontSize="sm">El video debe abrirse sin iniciar sesión y permitir su reproducción en otros sitios.</Text>
                </Stack>
              </ModalSection>
          </FormSection>

          {request && <Button type="button" colorScheme="green" onClick={() => void save(true)}>Aprobar y publicar</Button>}
        </Stack>
      </Box>}
  </Form></Card>;
}
