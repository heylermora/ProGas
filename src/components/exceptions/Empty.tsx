import { Box, Image, Text } from '@chakra-ui/react';
import illustration from "assets/img/exceptions/empty.svg";

const Empty = () => {
    return (
        <Box textAlign="center">
            <Image
                src={illustration}
                alt=""
                ml="auto"
                mr="auto"
                width="auto"
                maxHeight="450px"
            />
            <Text
                color="#A3AED0"
                fontSize="24px"
                fontWeight="500"
            >
                ¡Sin datos disponibles!
            </Text>

        </Box>
    );
};

export default Empty;
