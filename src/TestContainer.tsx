import { Box, Container, Typography } from '@mui/material';
import { SchemaInput } from './features/schemaEditor/SchemaInput';

function TestContainer() {
    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom textAlign="center">
                    JSON Schema Visualizer
                </Typography>
                <SchemaInput />
            </Box>
        </Container>
    );
}

export default TestContainer;
