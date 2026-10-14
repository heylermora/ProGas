import { HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { socialPresentation } from 'components/social/SocialLink';
import { SponsorNetwork } from 'utils/sponsor';

export default function SocialNetworkLabel({ network, label }: { network: SponsorNetwork; label: string }) {
  const neutral = useColorModeValue('gray.700', 'gray.200');
  const meta = socialPresentation('', network);
  return <HStack as="span" spacing={2}><Icon as={meta.icon} color={network === 'instagram' ? '#C13584' : meta.bg || neutral} boxSize="18px" aria-hidden="true" focusable={false} /><Text as="span">{label}</Text></HStack>;
}
