/* eslint-disable */
/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2022 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useState } from 'react';
import { NavLink, useHistory } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ResponsiveValue } from '@chakra-ui/react';
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import { registerUser } from "services/AuthService";
import Error from 'components/exceptions/Error';
// Assets
import illustration from "assets/img/auth/auth.jpg";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

function SignUp() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const history = useHistory();
  const [show, setShow] = useState(false);
  const [isError, setIsError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClick = () => setShow(!show);

  const handleSignUp = async () => {
    registerUser(email, password).then((response) => {
				console.log('Ok:', response);
        history.push('/order/index');
			})
			.catch((error) => {
				console.error('Error:', error);
				if (error?.response?.status !== 400) {
					setIsError(true);
				}
			});
  };

  // Responsive typed constants
  const maxWPrimary: ResponsiveValue<string> = { base: '100%', md: 'max-content' };
  const mxAutoLg: ResponsiveValue<string> = { base: 'auto', lg: '0px' };
  const mbPrimary: ResponsiveValue<string> = { base: '30px', md: '60px' };
  const pxPrimary: ResponsiveValue<string> = { base: '25px', md: '0px' };
  const mtPrimary: ResponsiveValue<string> = { base: '40px', md: '14vh' };
  const innerW: ResponsiveValue<string> = { base: '100%', md: '420px' };
  const innerMx: ResponsiveValue<string> = { base: 'auto', lg: 'unset' };
  const innerMb: ResponsiveValue<string> = { base: '20px', md: 'auto' };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      { isError ? (
        <Error />
      ) : (
        <>
          <Flex
            maxW={maxWPrimary}
            w='100%'
            mx={mxAutoLg}
            me='auto'
            h='100%'
            alignItems='start'
            justifyContent='center'
            mb={mbPrimary}
            px={pxPrimary}
            mt={mtPrimary}
            flexDirection='column'>
            <Box me='auto'>
              <Heading color={textColor} fontSize='36px' mb='10px'>
                Crea una cuenta
              </Heading>
              <Text
                mb='36px'
                ms='4px'
                color={textColorSecondary}
                fontWeight='400'
                fontSize='md'>
                ¡Ingrese su correo electrónico y contraseña para crear sesión!
              </Text>
            </Box>
            <Flex
              zIndex='2'
              direction='column'
              w={innerW}
              maxW='100%'
              background='transparent'
              borderRadius='15px'
              mx={innerMx}
              me='auto'
              mb={innerMb}>
              <Flex align='center' mb='25px'>
                <HSeparator />
              </Flex>
              <FormControl>
                <FormLabel
                  display='flex'
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  mb='8px'>
                  Email<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant='auth'
                  fontSize='sm'
                  ms={{ base: "0px", md: "0px" }}
                  type='email'
                  placeholder='mail@simmmple.com'
                  mb='24px'
                  fontWeight='500'
                  size='lg'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormLabel
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  display='flex'>
                  Contraseña<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size='md'>
                  <Input
                    isRequired={true}
                    fontSize='sm'
                    placeholder='Min. 8 caracteres'
                    mb='24px'
                    size='lg'
                    type={show ? "text" : "password"}
                    variant='auth'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement display='flex' alignItems='center' mt='4px'>
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
                <Button
                  fontSize='sm'
                  variant='brand'
                  fontWeight='500'
                  w='100%'
                  h='50'
                  mb='24px'
                  onClick={handleSignUp}
                >
                  Crear Cuenta
                </Button>
              </FormControl>
              <Flex
                flexDirection='column'
                justifyContent='center'
                alignItems='start'
                maxW='100%'
                mt='0px'>
                <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
                  ¿Ya tienes una cuenta?
                  <NavLink to='/auth/sign-in'>
                    <Text
                      color={textColorBrand}
                      as='span'
                      ms='5px'
                      fontWeight='500'>
                      Inicia sesión
                    </Text>
                  </NavLink>
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </>
    )}
    </DefaultAuth>
  );
}

export default SignUp;
