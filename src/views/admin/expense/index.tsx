import { useParams } from 'react-router-dom';
import {
    Box,
    Center,
    Text,
    useColorModeValue,
    Heading,
    Flex,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

import { HSeparator } from "components/separator/Separator";
import ExpenseCard from 'components/card/ExpenseCard';

import PayRollService from 'services/PayRollService';
import MaterialRequestService from 'services/MaterialRequestService';
import ReimbursementService from 'services/ReimbursementService';
import ServiceService from 'services/ServiceService';


export default function Index() {
    const brandStars = useColorModeValue('brand.500', 'brand.400');
    const textColor = useColorModeValue('navy.700', 'white');
    const { id } = useParams<{ id: string }>();

    return (
        <Box me="auto">
            <Heading color={textColor} fontSize="36px" mb="10px" sx={{ letterSpacing: '-0.72px' }}>
                Gastos del Proyecto
            </Heading>
            <Flex align='center' mb='25px'>
                <HSeparator />
            </Flex>
            <ExpenseCard title="Planilla" link="pay-roll" type="receipt" service={PayRollService} id={id} />
            <ExpenseCard title="Solicitud de Material" link="material-request" type="receipt" service={MaterialRequestService} id={id} />
            <ExpenseCard title="Reembolsos" link="reimbursement" type="receipt" service={ReimbursementService} id={id} />
            <ExpenseCard title="Servicios" link="service" type="receipt" service={ServiceService} id={id} />
            <Center mt="8px">
                <NavLink to={`/project/details/${id}`}>
                    <Text
                    color={brandStars}
                    as="span"   
                    fontWeight="500"
                    textAlign="center"
                    >
                    Volver
                    </Text>
                </NavLink>
            </Center>
        </Box>
    );
}