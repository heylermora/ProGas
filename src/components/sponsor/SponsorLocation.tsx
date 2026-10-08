import { Button, Flex, Stack, Text } from '@chakra-ui/react';
import SponsorItem from 'interfaces/SponsorItem';
import { sponsorNavigation } from 'utils/sponsor';

export default function SponsorLocation({ sponsor }: { sponsor: Pick<SponsorItem, 'coordinates' | 'directions'> }) {
  const navigation = sponsorNavigation(sponsor.coordinates);
  if (!navigation && !sponsor.directions) return null;
  return <Stack spacing={2} mt={3}>
    {sponsor.directions && <Text fontSize="sm" whiteSpace="pre-line" overflowWrap="anywhere"><Text as="span" fontWeight="700">Señas: </Text>{sponsor.directions}</Text>}
    {navigation && <Flex gap={2} wrap="wrap">
      <Button as="a" href={navigation.maps} target="_blank" rel="noopener noreferrer" size="sm" colorScheme="brand" variant="outline">Google Maps</Button>
      <Button as="a" href={navigation.waze} target="_blank" rel="noopener noreferrer" size="sm" colorScheme="brand" variant="outline">Waze</Button>
    </Flex>}
  </Stack>;
}
