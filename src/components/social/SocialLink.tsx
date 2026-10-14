import AnalyticsService from 'services/AnalyticsService';
import { AnalyticsSource } from 'interfaces/AnalyticsEvent';
import { Flex, Icon, IconButton, IconButtonProps, Text, Tooltip } from '@chakra-ui/react';
import { FaFacebookF, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdLink } from 'react-icons/md';
import { networkFor, SponsorNetwork, sponsorContactHref } from 'utils/sponsor';

const networks = {
  facebook: { label: 'Facebook', icon: FaFacebookF, bg: '#1877F2' },
  instagram: { label: 'Instagram', icon: FaInstagram, bg: 'linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)' },
  whatsapp: { label: 'WhatsApp', icon: FaWhatsapp, bg: '#25D366' },
  tiktok: { label: 'TikTok', icon: FaTiktok, bg: '#111111' },
  email: { label: 'Correo', icon: MdEmail, bg: '#F97316' },
  website: { label: 'Sitio web', icon: FaGlobe, bg: '#2563EB' },
};
export const socialPresentation = (href = '', network?: SponsorNetwork) => networks[network || networkFor(href)] || { label: 'Contacto', icon: MdLink, bg: '#64748B' };

type SocialLinkProps = Omit<IconButtonProps, 'icon' | 'as' | 'size' | 'aria-label'> & {
  href?: string;
  businessId?: string;
  source?: AnalyticsSource;
  network?: SponsorNetwork;
  label?: string;
  'aria-label'?: string;
  size?: 'compact' | 'regular' | 'large';
  compactOnMobile?: boolean;
};

export default function SocialLink({ href, businessId, source = 'mall', network, label, size = 'regular', compactOnMobile = false, 'aria-label': ariaLabel, ...props }: SocialLinkProps) {
  const meta = socialPresentation(href, network);
  const destination = href ? sponsorContactHref(href) : undefined;
  const external = Boolean(destination && /^https?:/i.test(destination));
  const desktopDiameter = { compact: '44px', regular: '48px', large: '56px' }[size];
  const diameter = compactOnMobile ? { base: '44px', md: desktopDiameter } : desktopDiameter;
  const name = ariaLabel || label || meta.label;
  const buttonProps: IconButtonProps = {
    ...props,
    onClick: (event) => {
      props.onClick?.(event);
      if (!event.defaultPrevented && destination && businessId) void AnalyticsService.track({ type: 'link_click', businessId, url: destination, source });
    },
    'aria-label': name,
    icon: <Icon as={meta.icon} boxSize={compactOnMobile ? { base: '22px', md: size === 'large' ? '26px' : '22px' } : size === 'large' ? '26px' : '22px'} aria-hidden="true" />,
    w: diameter, h: diameter, minW: diameter, maxW: diameter, minH: diameter, maxH: diameter,
    flexShrink: 0, p: 0, borderRadius: 'full', color: 'white', border: '0', bg: meta.bg,
    boxShadow: '0 6px 14px rgba(15,23,42,.16)',
    _hover: { filter: 'brightness(1.08)', textDecoration: 'none' },
    _focusVisible: { outline: '3px solid', outlineColor: 'cyan.400', outlineOffset: '3px' },
    sx: { ...props.sx, background: meta.bg, aspectRatio: '1 / 1', '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' } },
  };
  return <Tooltip label={name} hasArrow>{destination
    ? <IconButton as="a" href={destination} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...buttonProps} />
    : <IconButton type="button" {...buttonProps} />
  }</Tooltip>;
}

export function SocialContact({ caption, description, ...props }: SocialLinkProps & { caption: string; description?: string }) {
  return <Flex align="center" gap="10px" maxW="100%">
    <SocialLink {...props} label={props.label || caption} />
    <Flex direction="column" minW="0" gap="2px">
      <Text fontSize="sm" fontWeight="700">{caption}</Text>
      {description && <Text fontSize="xs" lineHeight="1.4">{description}</Text>}
    </Flex>
  </Flex>;
}


export function SocialLinksRow({ links, label, businessId, source, size = 'regular', labelPrefix = '' }: { links: string[]; label: string; businessId?: string; source?: AnalyticsSource; size?: SocialLinkProps['size']; labelPrefix?: string }) {
  return <Flex role="group" aria-label={label} w="100%" minW={0} maxW="100%" flexWrap="nowrap" gap={{ base: '4px', md: '8px' }} overflowX="auto" overflowY="hidden" py="8px" px="4px" sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
    {Array.from(new Set(links.filter(Boolean))).map(href => <SocialLink compactOnMobile key={href} href={href} businessId={businessId} source={source} size={size} label={businessId ? `${labelPrefix}${socialPresentation(href).label} de ${label.replace(/^Redes sociales de /, '')}` : socialPresentation(href).label} />)}
  </Flex>;
}
