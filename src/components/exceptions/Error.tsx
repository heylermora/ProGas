import { Box, Image, Text, Button } from '@chakra-ui/react';
import illustration from "assets/img/exceptions/error.svg";

const Error = () => {
    const handleRefresh = () => {
        window.location.reload();
    };
    
    return (
        <Box textAlign="center">
            <Text
                color="#A3AED0"
                fontSize="24px"
                fontWeight="500"
            >
                ¡Ha ocurrido  un error!
            </Text>
            <Text
                color="#1B2559"
                fontSize="14px"
            >
                Vuelve a intentar más tarde.
            </Text>
            <Image
                src={illustration}
                alt=""
                ml="auto"
                mr="auto"
                width="auto"
                maxHeight="450px"
            />
            <Button
                borderRadius="20px"
                background="#E53E3E"
                color="white"
                onClick={handleRefresh}
            >
                Refrescar
            </Button>
            

        </Box>
    );
};

export default Error;
