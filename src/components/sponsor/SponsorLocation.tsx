import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import SponsorItem from 'interfaces/SponsorItem';
import { sponsorNavigation } from 'utils/sponsor';

export default function SponsorLocation({ sponsor, showDirections = true }: { sponsor: Pick<SponsorItem, 'coordinates' | 'directions' | 'mapsUrl' | 'wazeUrl'>; showDirections?: boolean }) {
  const navigation = sponsorNavigation(sponsor.coordinates, sponsor.mapsUrl, sponsor.wazeUrl);
  if (!navigation && (!showDirections || !sponsor.directions)) return null;
  return <Stack spacing={2} mt={3}>
    {showDirections && sponsor.directions && <Text fontSize="sm" whiteSpace="pre-line" overflowWrap="anywhere"><Text as="span" fontWeight="700">Señas: </Text>{sponsor.directions}</Text>}
    {navigation && <Flex gap={2} wrap="wrap">
      {navigation.maps && <Button as="a" href={navigation.maps} target="_blank" rel="noopener noreferrer" size="sm" colorScheme="brand" variant="outline">Google Maps</Button>}
      {navigation.waze && <Button as="a" href={navigation.waze} target="_blank" rel="noopener noreferrer" size="sm" colorScheme="brand" variant="outline">Waze</Button>}
    </Flex>}
  </Stack>;
}
