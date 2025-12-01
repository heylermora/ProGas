/* eslint-disable */

import { NavLink, useLocation } from 'react-router-dom';
// chakra imports
import { Box, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';

export function SidebarLinks(props: {
	routes: RoutesType[];
}) {
	//   Chakra color mode
	let location = useLocation();
	let activeColor = useColorModeValue('gray.700', 'white');
	let activeIcon = useColorModeValue('brand.500', 'white');
	let textColor = useColorModeValue('secondaryGray.500', 'white');
	let brandColor = useColorModeValue('brand.500', 'brand.400');

	const { routes } = props;

	// verifies if routeName is the one active (in browser input)
	const activeRoute = (routeName: string) => {
		routeName = routeName.replace('?', '');
		return location.pathname.includes(routeName);
	};

	// this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
	const createLinks = (
		routes: RoutesType[], 
	) => {
		return routes.map(
			(
				route: RoutesType,
				index: number
			) => {
				if (route.layout === '/order' || route.layout === '/auth' || route.layout === '/dashboard') {
					return (
						<NavLink key={index} to={route.layout + route.path}>
							{route.icon ? (
								<Box>
									<HStack
										spacing={activeRoute(route.layout.toLowerCase()+route.path.toLowerCase()) ? '22px' : '26px'}
										py='5px'
										ps='10px'>
										<Flex w='100%' alignItems='center' justifyContent='center'>
											<Box
												color={activeRoute(route.layout.toLowerCase()+route.path.toLowerCase()) ? activeIcon : textColor}
												me='18px'>
												{route.icon}
											</Box>
											<Text
												me='auto'
												color={activeRoute(route.layout.toLowerCase()+route.path.toLowerCase()) ? activeColor : textColor}
												fontWeight={activeRoute(route.layout.toLowerCase()+route.path.toLowerCase()) ? 'bold' : 'normal'}>
												{route.name}
											</Text>
										</Flex>
										<Box
											h='36px'
											w='4px'
											bg={activeRoute(route.layout.toLowerCase()+route.path.toLowerCase()) ? brandColor : 'transparent'}
											borderRadius='5px'
										/>
									</HStack>
								</Box>
							) : (
								null
							)}
						</NavLink>
					);
				}
			}
		);
	};
	//  BRAND
	return <>{createLinks(routes)}</>
}

export default SidebarLinks;
