import { Input, SimpleGrid, Stack, Textarea } from '@chakra-ui/react';
import DeviceLocationMap from 'components/form/DeviceLocationMap';
import FormField from 'components/form/FormField';
import SponsorItem from 'interfaces/SponsorItem';
import { sponsorMapCoordinates, sponsorNavigation } from 'utils/sponsor';
import SponsorLocation from './SponsorLocation';

type LocationValue = Pick<SponsorItem, 'coordinates' | 'mapsUrl' | 'wazeUrl' | 'directions'>;
type Props = { value: LocationValue; onChange: (value: LocationValue) => void; errors?: Record<string, string> };

export default function SponsorLocationFields({ value, onChange, errors = {} }: Props) {
  const navigation = sponsorNavigation(value.coordinates, value.mapsUrl, value.wazeUrl);
  return <Stack spacing={4}>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
    <FormField label="Enlace de Google Maps" help="Opcional. Busque el negocio en Maps → Compartir → Copiar enlace." error={errors.mapsUrl}>
      <Input type="url" value={value.mapsUrl || navigation?.maps || ''} placeholder="Pegue aquí el enlace de Maps"
        onChange={event => {
          const coordinates = sponsorMapCoordinates(event.target.value);
          onChange({ ...value, mapsUrl: event.target.value, coordinates,
            wazeUrl: value.coordinates ? '' : value.wazeUrl || '' });
        }} />
    </FormField>
    <FormField label="Enlace de Waze" help="Opcional. Pegue el enlace compartido desde Waze." error={errors.wazeUrl}>
      <Input type="url" value={value.wazeUrl || navigation?.waze || ''} placeholder="Pegue aquí el enlace de Waze"
        onChange={event => onChange({ ...value, wazeUrl: event.target.value, coordinates: '', mapsUrl: value.mapsUrl || navigation?.maps || '' })} />
    </FormField>
    </SimpleGrid>
    <DeviceLocationMap compact coordinates={value.coordinates} buttonLabel="Estoy en el negocio: usar mi ubicación"
      successMessage="Ubicación agregada para Google Maps y Waze."
      onLocation={location => {
        const links = sponsorNavigation(location.coordinates);
        onChange({ ...value, coordinates: location.coordinates, mapsUrl: links.maps, wazeUrl: links.waze });
      }} />
    <FormField label="Señas del negocio" help="Opcional. Por ejemplo: frente al parque, local azul junto a la farmacia.">
      <Textarea rows={2} value={value.directions || ''} onChange={event => onChange({ ...value, directions: event.target.value })} />
    </FormField>
    <SponsorLocation sponsor={value} showDirections={false} />
  </Stack>;
}
