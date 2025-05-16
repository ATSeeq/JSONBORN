import { Box, Container } from '@mui/material';
import { SchemaInput } from './features/schemaEditor/SchemaInput';

function TestContainer() {
    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <SchemaInput />
            </Box>
        </Container>
    );
}

export default TestContainer;
