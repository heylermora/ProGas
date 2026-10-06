import {
Alert,
AlertIcon,
Badge,
Box, Divider, HStack,
Input,
Select,
SimpleGrid,
Stack,
Switch,
Text,
Textarea,
useColorModeValue
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import Form from 'components/form/Form';
import FormField from 'components/form/FormField';
import useCategories from 'hooks/useCategories';
import SponsorItem, { DEFAULT_BUSINESS_CATEGORY } from 'interfaces/SponsorItem';
import { useEffect, useState } from 'react';
import { MdInfoOutline, MdVisibility } from 'react-icons/md';
import { useHistory, useParams } from 'react-router-dom';
import SponsorService from 'services/SponsorService';

type SponsorFormState = Omit<SponsorItem, 'id'>;
type MessageState = { status: 'success' | 'warning' | 'error'; text: string };
const empty: SponsorFormState = { name: '', category: DEFAULT_BUSINESS_CATEGORY, active: true, order: 1, logoUrl: '', videoUrl: '', links: ['', '', '', ''], description: '' };
const MAX_FIRESTORE_VIDEO_BYTES = 850 * 1024;

export default function SponsorForm() {
  const { categories } = useCategories('sponsors');
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const [sponsor, setSponsor] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const cardBg = useColorModeValue('white', 'navy.800');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const sectionBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  useEffect(() => { if (id) SponsorService.get(id).then((s) => setSponsor({ ...empty, ...s, links: [...(s.links || []), '', '', '', ''].slice(0, 4) })); }, [id]);

  const set = <K extends keyof SponsorFormState>(key: K, value: SponsorFormState[K]) => setSponsor((prev) => ({ ...prev, [key]: value }));
  const showMessage = (status: MessageState['status'], text: string) => setMessage({ status, text });

  const readFile = (key: 'logoUrl' | 'videoUrl', file?: File) => {
    if (!file) return;

    if (key === 'videoUrl' && file.size > MAX_FIRESTORE_VIDEO_BYTES) {
      showMessage('warning', 'El video es muy pesado para guardarlo directo. Pegá un link de video público o subí un archivo menor a 850 KB para esta demo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      set(key, String(reader.result || ''));
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
    <Form title={id ? 'Editar patrocinador' : 'Nuevo patrocinador'} description="Configure su presencia pública y sus contactos."
      onBack={() => history.push('/admin/sponsor/index')} submitLabel="Guardar patrocinador" isSubmitting={saving}
      pt={{ base: '86px', md: '80px' }} pb="36px" onFormSubmit={event => { event.preventDefault(); save(); }}>

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
            <FormField  label={<>Título / nombre</>} help={<> Opcional. Si queda vacío, el card muestra solo el logo y links. </>}>

              <Input value={sponsor.name} placeholder="Ej. Restaurante El Centro" onChange={(e) => set('name', e.target.value)} />

            </FormField>
            <FormField  label={<>Categoría comercial</>}>

              <Select value={sponsor.category} onChange={(e) => set('category', e.target.value)}>{sponsor.category && !categories.includes(sponsor.category) && <option>{sponsor.category}</option>}{categories.map((category) => <option key={category}>{category}</option>)}</Select>
            </FormField>
            <FormField  label={<>Orden</>} help={<> Define la posición del negocio dentro de su categoría. </>}>

              <Input type="number" min="1" value={sponsor.order} onChange={(e) => set('order', Number(e.target.value))} />

            </FormField>
            <FormField display="flex" alignItems="center" gap="10px" pt={{ base: 0, md: '30px' }} label={<>Mostrar públicamente</>}>
              <Switch isChecked={sponsor.active} onChange={(e) => set('active', e.target.checked)} />

            </FormField>
          </SimpleGrid>

          <Divider />

          <Stack spacing="12px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Contenido visual</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              <FormField  label={<>Subir logo</>} help={<> Recomendado: PNG o JPG horizontal con fondo transparente o claro. </>}>

                <Input type="file" accept="image/*" onChange={(e) => readFile('logoUrl', e.target.files?.[0])} />

              </FormField>
              <FormField  label={<>Link o iframe de video</>} help={<> Opcional. Pegá iframe o link embed público para evitar límites de guardado. </>}>

                  <Input value={sponsor.videoUrl?.startsWith('data:') ? '' : sponsor.videoUrl} placeholder='<iframe src="https://..."></iframe> o https://...' onChange={(e) => set('videoUrl', e.target.value)} />

                </FormField>
              <FormField  label={<>O subir video pequeño</>} help={<> Opcional, menor a 850 KB. Si falla al guardar, usá el link de video. </>}>

                  <Input type="file" accept="video/*" onChange={(e) => readFile('videoUrl', e.target.files?.[0])} />

                </FormField>
            </SimpleGrid>
          </Stack>

          <FormField p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px" label={<>Descripción</>} help={<> Opcional. Usá una frase corta para que no sature el card. </>}>

            <Textarea value={sponsor.description} placeholder="Mensaje corto del negocio, promoción o categoría." onChange={(e) => set('description', e.target.value)} />

          </FormField>

          <Stack spacing="12px" p={{ base: '14px', md: '16px' }} bg={sectionBg} borderRadius="16px">
            <Text fontWeight="800" fontSize={{ base: 'md', md: 'lg' }}>Links de contacto</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              {sponsor.links.map((link, i) => (
                <FormField key={i} label={<>Link {i + 1}</>}>

                  <Input value={link} placeholder="https://, wa.me/ o correo" onChange={(e) => set('links', sponsor.links.map((l, idx) => idx === i ? e.target.value : l))} />
                </FormField>
              ))}
            </SimpleGrid>
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
    </Form>
  );
}
