import { Alert, AlertIcon, Button, Link, Stack } from '@chakra-ui/react';
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
import { loginUser, requestPasswordReset } from "services/AuthService";
// Assets
import illustration from "assets/img/auth/auth.jpg";
import Form from 'components/form/Form';

function SignIn() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [recovering, setRecovering] = useState(false);



  const handleSignIn = async () => {
    if (isSubmitting) return;
    setRecovering(false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) { setFeedback('Revise el correo electrónico y la contraseña.'); return; }
    setFeedback("");
    setIsSubmitting(true);
    loginUser(email, password).then(() => {
        history.push('/admin/order/index');
      })
      .catch(() => setFeedback('No fue posible iniciar sesión. Verificá los datos e intentá nuevamente.'))
      .finally(() => setIsSubmitting(false));
  };

  const handlePasswordReset = async () => {
    setRecovering(true);
    if (!email.trim()) {
      setFeedback('Ingresá tu correo electrónico para solicitar la recuperación.');
      return;
    }
    try {
      await requestPasswordReset(email);
      setFeedback('Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.');
    } catch {
      // Keep the response neutral so the form does not disclose registered accounts.
      setFeedback('Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.');
    }
  };
  return <DefaultAuth illustrationBackground={illustration} image={illustration}>
    <Box w="100%" maxW="420px" mx="auto" px={{ base: 5, md: 0 }} py={{ base: 8, md: 12 }}>
      <Form title="Iniciar sesión" description="Ingrese su correo electrónico y contraseña." submitLabel="Ingresar" isSubmitting={isSubmitting}
        loadingLabel="Ingresando" onFormSubmit={event => { event.preventDefault(); handleSignIn(); }}>
        <Stack spacing={4}>
          <FormField id="signIn-email" label="Correo electrónico" isRequired isDisabled={isSubmitting}>
            <Input id="signIn-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} />
          </FormField>
          <PasswordField id="signIn-password" value={password} onChange={setPassword} isNew={false} isDisabled={isSubmitting} />
          <Button type="button" variant="link" colorScheme="brand" alignSelf="flex-start" onClick={handlePasswordReset} isDisabled={isSubmitting}>¿Olvidó su contraseña?</Button>
          {feedback && <Alert status={recovering ? "info" : "error"}><AlertIcon />{feedback}</Alert>}
        </Stack>
      </Form>
      <Text mt={5} fontSize="sm">¿No tiene cuenta? <Link as={NavLink} to="/auth/sign-up" color="brand.500" fontWeight="700">Crear cuenta</Link></Text>
    </Box>
  </DefaultAuth>;
}

export default SignIn;
