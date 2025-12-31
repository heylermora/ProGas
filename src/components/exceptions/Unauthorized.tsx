import { Box, Image, Text, Button } from '@chakra-ui/react';
import illustration from "assets/img/exceptions/unauthorized.svg"; // Cambia la ilustración si tienes otra

const Unauthorized = () => {
    const handleRedirect = () => {
        window.location.href = "/auth/sign-in";
    };

    return (
        <Box textAlign="center">
            <Text
                color="#A3AED0"
                fontSize="24px"
                fontWeight="500"
            >
                ¡Acceso no autorizado!
            </Text>

            <Text
                color="#1B2559"
                fontSize="14px"
            >
                No tienes acceso a esta sección.
                Por favor, vuelve a ingresar con tu cuenta.
            </Text>

            <Image
                src={illustration}
                alt="Unauthorized Illustration"
                ml="auto"
                mr="auto"
                width="auto"
                maxHeight="450px"
            />

            <Button
                borderRadius="20px"
                background="#3182CE"
                color="white"
                onClick={handleRedirect}
            >
                Ir a iniciar sesión
            </Button>
        </Box>
    );
};

export default Unauthorized;