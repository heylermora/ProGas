import { Alert, AlertIcon, Link, Stack } from '@chakra-ui/react';
import FormField from 'components/form/FormField';
import PasswordField from 'components/form/PasswordField';
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
Box, Input, Text
} from "@chakra-ui/react";
// Custom components
import DefaultAuth from "layouts/auth/Default";
import { registerUser } from "services/AuthService";
// Assets
import illustration from "assets/img/auth/auth.jpg";
import Form from 'components/form/Form';

function SignUp() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");



  const handleSignUp = async () => {
    if (isSubmitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password || password.length < 6) { setFeedback('Revise el correo electrónico y la contraseña.'); return; }
    setFeedback("");
    setIsSubmitting(true);
    registerUser(email, password).then(() => {
        history.push('/customer/data');
			})
			.catch(() => setFeedback('No fue posible crear la cuenta. Revisá el correo y los requisitos de la contraseña.'))
      .finally(() => setIsSubmitting(false));
  };

  return <DefaultAuth illustrationBackground={illustration} image={illustration}>
    <Box w="100%" maxW="420px" mx="auto" px={{ base: 5, md: 0 }} py={{ base: 8, md: 12 }}>
      <Form title="Crear cuenta" description="Ingrese su correo electrónico y contraseña." submitLabel="Crear cuenta" isSubmitting={isSubmitting}
        loadingLabel="Creando cuenta" onFormSubmit={event => { event.preventDefault(); handleSignUp(); }}>
        <Stack spacing={4}>
          <FormField id="signUp-email" label="Correo electrónico" isRequired isDisabled={isSubmitting}>
            <Input id="signUp-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />
          </FormField>
          <PasswordField id="signUp-password" value={password} onChange={setPassword} isNew={true} isDisabled={isSubmitting} />
          {feedback && <Alert status="error"><AlertIcon />{feedback}</Alert>}
        </Stack>
      </Form>
      <Text mt={5} fontSize="sm">¿Ya tiene cuenta? <Link as={NavLink} to="/auth/sign-in" color="brand.500" fontWeight="700">Iniciar sesión</Link></Text>
    </Box>
  </DefaultAuth>;
}

export default SignUp;
