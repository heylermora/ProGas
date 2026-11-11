import { Stack, StackProps, Text } from '@chakra-ui/react';
import { appVersion, deployedBuild } from 'utils/appVersion';

export default function AppVersion(props: StackProps) {
  return <Stack spacing="1px" fontSize="11px" lineHeight="1.5" {...props}>
    <Text>Versión {appVersion}</Text>
    <Text opacity={.85} overflowWrap="anywhere">{deployedBuild}</Text>
  </Stack>;
}
