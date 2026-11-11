import { mode } from '@chakra-ui/theme-tools';
export const buttonStyles = {
	components: {
		Button: {
			baseStyle: {
				borderRadius: '14px',
				minH: '44px',
				minW: 0,
				maxW: '100%',
				fontWeight: '700',
				lineHeight: '1.25',
				textAlign: 'center',
				whiteSpace: 'normal',
				overflowWrap: 'anywhere',
				boxShadow: '45px 76px 113px 7px rgba(112, 144, 176, 0.08)',
				transition: '.25s all ease',
				boxSizing: 'border-box',
				_focus: {
					boxShadow: 'none'
				},
				_focusVisible: {
					boxShadow: '0 0 0 3px rgba(66, 42, 251, 0.28)'
				},
				_disabled: {
					opacity: 0.55,
					cursor: 'not-allowed',
					boxShadow: 'none',
					transform: 'none'
				},
				_active: {
					boxShadow: 'none'
				}
			},
			variants: {
                mapReturn: {
                    w: '100%', maxW: '360px', h: '56px', minH: '56px',
                    px: '10px', gap: '10px', borderRadius: '16px',
                    bgGradient: 'linear(135deg, #FFF3B0, #FACC15 65%, #F59E0B)',
                    color: '#172554', border: '2px solid', borderColor: '#FDE68A',
                    boxShadow: 'inset 0 2px 0 rgba(255,255,255,.65), 0 4px 0 #9A5B08, 0 6px 20px rgba(250,204,21,.3)',
                    transition: 'transform .15s ease, box-shadow .15s ease',
                    _hover: { bgGradient: 'linear(135deg, #FFF9DB, #FDE047 65%, #FBBF24)', transform: 'translateY(-2px)' },
                    _active: { transform: 'translateY(3px)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,.5), 0 1px 0 #9A5B08' },
                    _focusVisible: { outline: '3px solid #22D3EE', outlineOffset: '4px' },
                    _disabled: { opacity: .55, cursor: 'not-allowed', transform: 'none', boxShadow: 'none' },
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none', _hover: { transform: 'none' }, _active: { transform: 'none' } },
                },
				outline: () => ({
					borderRadius: '16px'
				}),
				brand: (props: any) => ({
					bg: mode('brand.500', 'brand.400')(props),
					color: 'white',
					_focus: {
						bg: mode('brand.500', 'brand.400')(props)
					},
					_active: {
						bg: mode('brand.500', 'brand.400')(props)
					},
					_hover: {
						bg: mode('brand.600', 'brand.300')(props),
						transform: 'translateY(-1px)',
						boxShadow: '0 10px 20px rgba(66, 42, 251, 0.22)'
					}
				}),
				darkBrand: (props: any) => ({
					bg: mode('brand.900', 'brand.400')(props),
					color: 'white',
					_focus: {
						bg: mode('brand.900', 'brand.400')(props)
					},
					_active: {
						bg: mode('brand.900', 'brand.400')(props)
					},
					_hover: {
						bg: mode('brand.800', 'brand.400')(props)
					}
				}),
				lightBrand: (props: any) => ({
					bg: mode('#F2EFFF', 'whiteAlpha.100')(props),
					color: mode('brand.500', 'white')(props),
					_focus: {
						bg: mode('#F2EFFF', 'whiteAlpha.100')(props)
					},
					_active: {
						bg: mode('secondaryGray.300', 'whiteAlpha.100')(props)
					},
					_hover: {
						bg: mode('secondaryGray.400', 'whiteAlpha.200')(props)
					}
				}),
				light: (props: any) => ({
					bg: mode('secondaryGray.300', 'whiteAlpha.100')(props),
					color: mode('secondaryGray.900', 'white')(props),
					_focus: {
						bg: mode('secondaryGray.300', 'whiteAlpha.100')(props)
					},
					_active: {
						bg: mode('secondaryGray.300', 'whiteAlpha.100')(props)
					},
					_hover: {
						bg: mode('secondaryGray.400', 'whiteAlpha.200')(props)
					}
				}),
				action: (props: any) => ({
					fontWeight: '500',
					borderRadius: '50px',
					bg: mode('secondaryGray.300', 'brand.400')(props),
					color: mode('brand.500', 'white')(props),
					_focus: {
						bg: mode('secondaryGray.300', 'brand.400')(props)
					},
					_active: { bg: mode('secondaryGray.300', 'brand.400')(props) },
					_hover: {
						bg: mode('secondaryGray.200', 'brand.400')(props)
					}
				}),
				setup: (props: any) => ({
					fontWeight: '500',
					borderRadius: '50px',
					bg: mode('transparent', 'brand.400')(props),
					border: mode('1px solid', '0px solid')(props),
					borderColor: mode('secondaryGray.400', 'transparent')(props),
					color: mode('secondaryGray.900', 'white')(props),
					_focus: {
						bg: mode('transparent', 'brand.400')(props)
					},
					_active: { bg: mode('transparent', 'brand.400')(props) },
					_hover: {
						bg: mode('secondaryGray.100', 'brand.400')(props)
					}
				})
			}
		}
	}
};
