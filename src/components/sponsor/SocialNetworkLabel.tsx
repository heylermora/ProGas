import { HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { SponsorNetwork } from 'utils/sponsor';

const icons = { facebook: FaFacebookF, instagram: FaInstagram, tiktok: FaTiktok, whatsapp: FaWhatsapp, website: FaGlobe, email: MdEmail };
const colors = { facebook: '#1877F2', instagram: '#C13584', whatsapp: '#128C7E' };

export default function SocialNetworkLabel({ network, label }: { network: SponsorNetwork; label: string }) {
  const neutral = useColorModeValue('gray.700', 'gray.200');
  return <HStack as="span" spacing={2}><Icon as={icons[network]} color={colors[network as keyof typeof colors] || neutral} boxSize="18px" aria-hidden="true" focusable={false} /><Text as="span">{label}</Text></HStack>;
}
